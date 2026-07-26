// @ts-nocheck
import JSZip from 'jszip';
import {
  ChartType,
  ChartSpec,
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

const VISUAL_TYPE_MAP: Record<string, ChartType> = {
  barChart: 'bar',
  clusteredBarChart: 'bar',
  stackedBarChart: 'bar',
  hundredPercentStackedBarChart: 'bar',
  columnChart: 'bar',
  clusteredColumnChart: 'bar',
  stackedColumnChart: 'bar',
  hundredPercentStackedColumnChart: 'bar',
  lineChart: 'line',
  areaChart: 'area',
  stackedAreaChart: 'area',
  lineStackedColumnComboChart: 'combo',
  lineClusteredColumnComboChart: 'combo',
  pieChart: 'pie',
  donutChart: 'pie',
  treemap: 'treemap',
  scatterChart: 'scatter',
  map: 'map',
  filledMap: 'map',
  shapeMap: 'map',
  gauge: 'gauge',
  card: 'kpi',
  multiRowCard: 'kpi',
  kpi: 'kpi',
  tableEx: 'table',
  matrix: 'table',
  pivotTable: 'table',
  funnel: 'funnel',
  heatmap: 'heatmap',
};

export class PowerBIParser {
  async parse(fileBuffer: Buffer): Promise<ParseResult> {
    const start = Date.now();
    const warnings: string[] = [];

    try {
      const zip = await JSZip.loadAsync(fileBuffer);

      const layoutFile = zip.file('Report/Layout');
      if (!layoutFile) {
        return createParseResult(false, null, ['Missing Report/Layout in .pbix file']);
      }

      const layoutJson = await layoutFile.async('string');
      const layout = JSON.parse(layoutJson);

      const dataSources = await this.extractDataSources(zip, warnings);
      const measures = this.extractMeasures(layout, warnings);
      const dimensions = this.extractDimensions(layout, warnings);
      const pages = this.extractPages(layout, warnings);
      const filters = this.extractReportFilters(layout);

      const dashboard = createDashboard({
        title: layout.config?.name ?? layout.reportName ?? 'Power BI Report',
        sourceFormat: 'pbix',
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

  private async extractDataSources(zip: JSZip, warnings: string[]): Promise<DataSourceSpec[]> {
    const sources: DataSourceSpec[] = [];
    const mashupFile = zip.file('DataMashup');

    if (!mashupFile) {
      warnings.push('No DataMashup found; connection details unavailable');
      return sources;
    }

    try {
      const mashupBuffer = await mashupFile.async('nodebuffer');
      const mashupZip = await JSZip.loadAsync(mashupBuffer);
      const formulaFile = mashupZip.file('Formulas/Section1.m');

      if (formulaFile) {
        const mCode = await formulaFile.async('string');
        const sourceMatches = mCode.matchAll(
          /shared\s+(\w+)\s*=.*?Source\s*=\s*(\w+)\.(\w+)\(([^)]*)\)/gs
        );

        for (const match of sourceMatches) {
          const name = match[1];
          const connector = match[2].toLowerCase();
          const connStr = match[4].replace(/["\s]/g, '');
          const type = this.mapConnectorType(connector);
          sources.push({ name, type, connectionString: connStr, query: '', tables: [] });
        }

        const tableMatches = mCode.matchAll(/Navigation\.\w+\(.*?"(\w+)"/g);
        for (const match of tableMatches) {
          if (sources.length > 0) {
            sources[sources.length - 1].tables.push(match[1]);
          }
        }
      }
    } catch (e) {
      warnings.push(`Failed to parse DataMashup: ${(e as Error).message}`);
    }

    return sources;
  }

  private extractMeasures(layout: any, warnings: string[]): MeasureSpec[] {
    const measures: MeasureSpec[] = [];
    const sections = layout.sections ?? [];
    for (const section of sections) {
      const containers = section.visualContainers ?? [];
      for (const container of containers) {
        try {
          const config = JSON.parse(container.config ?? '{}');
          const projections = config.singleVisual?.projections ?? {};
          const values = projections.Values ?? projections.Y ?? [];
          for (const val of values) {
            const expr = val.queryRef ?? '';
            if (expr && !measures.find((m) => m.name === expr)) {
              measures.push({
                name: expr,
                expression: expr,
                sqlEquivalent: this.mExpressionToSql(expr),
                description: '',
                formatString: val.format ?? '#,##0',
                dataType: 'numeric',
              });
            }
          }
        } catch {
          // skip malformed container config
        }
      }
    }
    return measures;
  }

  private extractDimensions(layout: any, warnings: string[]): DimensionSpec[] {
    const dimensions: DimensionSpec[] = [];
    const sections = layout.sections ?? [];
    for (const section of sections) {
      const containers = section.visualContainers ?? [];
      for (const container of containers) {
        try {
          const config = JSON.parse(container.config ?? '{}');
          const projections = config.singleVisual?.projections ?? {};
          const cats = projections.Category ?? projections.X ?? projections.Rows ?? [];
          for (const cat of cats) {
            const name = cat.queryRef ?? '';
            if (name && !dimensions.find((d) => d.name === name)) {
              dimensions.push({ name, sourceColumn: name, dataType: 'string', hierarchy: '' });
            }
          }
        } catch {
          // skip malformed
        }
      }
    }
    return dimensions;
  }

  private extractPages(layout: any, warnings: string[]): PageSpec[] {
    const pages: PageSpec[] = [];
    const sections = layout.sections ?? [];

    for (const section of sections) {
      const charts: ChartSpec[] = [];
      const containers = section.visualContainers ?? [];

      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        try {
          const config = JSON.parse(container.config ?? '{}');
          const visualType = config.singleVisual?.visualType ?? 'unknown';
          const chartType = this.mapVisualType(visualType);
          const titleObj = config.singleVisual?.vcObjects?.title;
          const title = titleObj?.[0]?.properties?.text?.expr?.Literal?.Value ?? '';

          const projections = config.singleVisual?.projections ?? {};
          const measureRefs = (projections.Values ?? projections.Y ?? [])
            .map((v: any) => v.queryRef ?? '')
            .filter(Boolean);
          const dimRefs = (projections.Category ?? projections.X ?? projections.Rows ?? [])
            .map((v: any) => v.queryRef ?? '')
            .filter(Boolean);

          charts.push(
            createChart({
              id: `${section.name ?? 'page'}_v${i}`,
              title: title.replace(/'/g, ''),
              chartType,
              measures: measureRefs,
              dimensions: dimRefs,
              row: Math.floor((container.y ?? 0) / 100),
              col: Math.floor((container.x ?? 0) / 100),
              width: Math.ceil((container.width ?? 300) / 100),
              height: Math.ceil((container.height ?? 200) / 100),
            })
          );
        } catch {
          warnings.push(`Skipped malformed visual container at index ${i}`);
        }
      }

      pages.push({
        name: section.displayName ?? section.name ?? `Page ${pages.length + 1}`,
        charts,
        filters: [],
      });
    }
    return pages;
  }

  private extractReportFilters(layout: any): FilterSpec[] {
    const filters: FilterSpec[] = [];
    try {
      const rawFilters = JSON.parse(layout.filters ?? '[]');
      for (const f of rawFilters) {
        filters.push({
          field: f.expression?.Column?.Property ?? f.name ?? '',
          operator: f.type === 'Categorical' ? 'in' : 'between',
          values: f.filter?.Where?.[0]?.Condition?.In?.Values ?? [],
          isSlicer: false,
        });
      }
    } catch {
      // no report-level filters
    }
    return filters;
  }

  private mapVisualType(pbiType: string): ChartType {
    return VISUAL_TYPE_MAP[pbiType] ?? 'table';
  }

  private mapConnectorType(connector: string): DataSourceSpec['type'] {
    if (connector.includes('snowflake')) return 'snowflake';
    if (connector.includes('postgresql') || connector.includes('postgres')) return 'postgres';
    if (connector.includes('mysql')) return 'mysql';
    if (connector.includes('sql')) return 'mssql';
    if (connector.includes('oracle')) return 'oracle';
    if (connector.includes('excel')) return 'excel';
    if (connector.includes('csv')) return 'csv';
    return 'embedded';
  }

  private mExpressionToSql(expr: string): string {
    return expr
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/SUM\((.+)\)/i, 'SUM($1)')
      .replace(/COUNT\((.+)\)/i, 'COUNT($1)')
      .replace(/AVERAGE\((.+)\)/i, 'AVG($1)');
  }
}

