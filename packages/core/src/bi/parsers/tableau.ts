// @ts-nocheck
import { XMLParser } from 'fast-xml-parser';
import JSZip from 'jszip';
import {
  ChartType,
  DataSourceSpec,
  DimensionSpec,
  FilterSpec,
  MeasureSpec,
  PageSpec,
  ParseResult,
  createDashboard,
  createChart,
  createParseResult,
} from '../models';

const MARK_TYPE_MAP: Record<string, ChartType> = {
  Bar: 'bar',
  Line: 'line',
  Area: 'area',
  Square: 'heatmap',
  Circle: 'scatter',
  Shape: 'scatter',
  Pie: 'pie',
  Gantt: 'bar',
  Polygon: 'map',
  Map: 'map',
  Text: 'table',
  Automatic: 'bar',
};

export class TableauParser {
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true,
    parseAttributeValue: true,
  });

  async parse(fileBuffer: Buffer): Promise<ParseResult> {
    const start = Date.now();
    const warnings: string[] = [];

    try {
      let xmlContent: string;
      const header = fileBuffer.slice(0, 4).toString('hex');

      if (header === '504b0304') {
        const zip = await JSZip.loadAsync(fileBuffer);
        const twbFile = Object.keys(zip.files).find((f) => f.endsWith('.twb'));
        if (!twbFile) {
          return createParseResult(false, null, ['No .twb file found inside .twbx']);
        }
        xmlContent = await zip.files[twbFile].async('string');
      } else {
        xmlContent = fileBuffer.toString('utf-8');
      }

      const parsed = this.xmlParser.parse(xmlContent);
      const workbook = parsed.workbook;
      if (!workbook) {
        return createParseResult(false, null, ['Invalid Tableau workbook: no <workbook> root']);
      }

      const dataSources = this.extractDataSources(workbook, warnings);
      const measures = this.extractMeasures(workbook);
      const dimensions = this.extractDimensions(workbook);
      const pages = this.extractPages(workbook, warnings);
      const filters = this.extractFilters(workbook);

      const dashboard = createDashboard({
        title: workbook['@_name'] ?? 'Tableau Workbook',
        sourceFormat: 'twb',
        dataSources,
        measures,
        dimensions,
        pages,
        filters,
        mode: 'snapshot',
        warnings,
      });

      const result = createParseResult(true, dashboard);
      result.parseDurationMs = Date.now() - start;
      return result;
    } catch (e) {
      const result = createParseResult(false, null, [(e as Error).message]);
      result.parseDurationMs = Date.now() - start;
      return result;
    }
  }

  private extractDataSources(workbook: any, warnings: string[]): DataSourceSpec[] {
    const sources: DataSourceSpec[] = [];
    const rawSources = this.toArray(workbook.datasources?.datasource);

    for (const ds of rawSources) {
      const name = ds['@_name'] ?? ds['@_caption'] ?? 'Unknown';
      const connection = ds.connection;
      if (!connection) continue;

      const dbClass = (connection['@_class'] ?? '').toLowerCase();
      const type = this.mapConnectionType(dbClass);
      const server = connection['@_server'] ?? '';
      const dbName = connection['@_dbname'] ?? '';
      const tables: string[] = [];

      const relations = this.toArray(connection.relation);
      for (const rel of relations) {
        const tableName = rel['@_table'] ?? rel['@_name'] ?? '';
        if (tableName) tables.push(tableName.replace(/[\[\]"]/g, ''));
      }

      sources.push({
        name,
        type,
        connectionString: server ? `${server}/${dbName}` : '',
        query: connection['@_query'] ?? '',
        tables,
      });
    }
    return sources;
  }

  private extractMeasures(workbook: any): MeasureSpec[] {
    const measures: MeasureSpec[] = [];
    const rawSources = this.toArray(workbook.datasources?.datasource);

    for (const ds of rawSources) {
      const columns = this.toArray(ds.column);
      for (const col of columns) {
        if (col['@_role'] !== 'measure') continue;
        const name = (col['@_name'] ?? '').replace(/[\[\]]/g, '');
        const formula = col.calculation?.['@_formula'] ?? '';
        measures.push({
          name,
          expression: formula,
          sqlEquivalent: this.tableauFormulaToSql(formula),
          description: col['@_caption'] ?? '',
          formatString: col['@_default-format'] ?? '#,##0',
          dataType: col['@_datatype'] ?? 'real',
        });
      }
    }
    return measures;
  }

  private extractDimensions(workbook: any): DimensionSpec[] {
    const dimensions: DimensionSpec[] = [];
    const rawSources = this.toArray(workbook.datasources?.datasource);

    for (const ds of rawSources) {
      const columns = this.toArray(ds.column);
      for (const col of columns) {
        if (col['@_role'] !== 'dimension') continue;
        const name = (col['@_name'] ?? '').replace(/[\[\]]/g, '');
        dimensions.push({
          name,
          sourceColumn: name,
          dataType: col['@_datatype'] ?? 'string',
          hierarchy: col['@_hierarchy-name'] ?? '',
        });
      }
    }
    return dimensions;
  }

  private extractPages(workbook: any, warnings: string[]): PageSpec[] {
    const pages: PageSpec[] = [];
    const worksheets = this.toArray(workbook.worksheets?.worksheet);
    const dashboards = this.toArray(workbook.dashboards?.dashboard);

    if (dashboards.length > 0) {
      for (const dash of dashboards) {
        const zones = this.toArray(dash.zones?.zone);
        const charts = zones
          .filter((z: any) => z['@_name'])
          .map((z: any, idx: number) => {
            const wsName = z['@_name'] ?? `zone_${idx}`;
            const ws = worksheets.find((w: any) => w['@_name'] === wsName);
            const markType = this.getMarkType(ws);
            return createChart({
              id: `${dash['@_name'] ?? 'dash'}_${idx}`,
              title: wsName,
              chartType: markType,
              row: Math.floor((z['@_y'] ?? 0) / 100),
              col: Math.floor((z['@_x'] ?? 0) / 100),
              width: Math.ceil((z['@_w'] ?? 400) / 100),
              height: Math.ceil((z['@_h'] ?? 300) / 100),
            });
          });

        pages.push({
          name: dash['@_name'] ?? `Dashboard ${pages.length + 1}`,
          charts,
          filters: [],
        });
      }
    } else {
      const charts = worksheets.map((ws: any, idx: number) =>
        createChart({
          id: `ws_${idx}`,
          title: ws['@_name'] ?? `Sheet ${idx + 1}`,
          chartType: this.getMarkType(ws),
        })
      );
      if (charts.length > 0) {
        pages.push({ name: 'Worksheets', charts, filters: [] });
      }
    }
    return pages;
  }

  private extractFilters(workbook: any): FilterSpec[] {
    const filters: FilterSpec[] = [];
    const worksheets = this.toArray(workbook.worksheets?.worksheet);

    for (const ws of worksheets) {
      const wsFilters = this.toArray(ws.table?.view?.filter);
      for (const f of wsFilters) {
        const field = (f['@_column'] ?? '').replace(/[\[\]]/g, '');
        const members = this.toArray(f.groupfilter?.groupfilter).map(
          (m: any) => m['@_member'] ?? ''
        );
        if (field) {
          filters.push({
            field,
            operator: f['@_included-values'] === 'in' ? 'in' : 'exclude',
            values: members.filter(Boolean),
            isSlicer: false,
          });
        }
      }
    }
    return filters;
  }

  private getMarkType(ws: any): ChartType {
    if (!ws) return 'table';
    const mark = ws.table?.pane?.mark?.['@_class'] ?? ws.table?.view?.mark?.['@_class'] ?? '';
    return MARK_TYPE_MAP[mark] ?? 'bar';
  }

  private mapConnectionType(dbClass: string): DataSourceSpec['type'] {
    if (dbClass.includes('snowflake')) return 'snowflake';
    if (dbClass.includes('postgres')) return 'postgres';
    if (dbClass.includes('mysql')) return 'mysql';
    if (dbClass.includes('sqlserver') || dbClass.includes('mssql')) return 'mssql';
    if (dbClass.includes('oracle')) return 'oracle';
    if (dbClass.includes('excel')) return 'excel';
    if (dbClass.includes('csv') || dbClass.includes('textscan')) return 'csv';
    return 'embedded';
  }

  private tableauFormulaToSql(formula: string): string {
    if (!formula) return '';
    return formula
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/ATTR\((.+)\)/i, '$1')
      .replace(/COUNTD\((.+)\)/i, 'COUNT(DISTINCT $1)')
      .replace(/ZN\((.+)\)/i, 'COALESCE($1, 0)');
  }

  private toArray(val: any): any[] {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }
}


