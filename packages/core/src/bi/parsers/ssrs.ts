// @ts-nocheck
import { XMLParser } from 'fast-xml-parser';
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

const SSRS_CHART_MAP: Record<string, ChartType> = {
  Column: 'bar',
  Bar: 'bar',
  Line: 'line',
  Area: 'area',
  Pie: 'pie',
  Doughnut: 'pie',
  Scatter: 'scatter',
  Bubble: 'scatter',
  Shape: 'map',
  Polar: 'area',
  Range: 'area',
  Funnel: 'funnel',
  Gauge: 'gauge',
  Indicator: 'kpi',
};

export class SSRSParser {
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseAttributeValue: true,
    allowBooleanAttributes: true,
  });

  async parse(fileBuffer: Buffer): Promise<ParseResult> {
    const start = Date.now();
    const warnings: string[] = [];

    try {
      const xmlContent = fileBuffer.toString('utf-8');
      const parsed = this.xmlParser.parse(xmlContent);
      const report = parsed.Report;

      if (!report) {
        return createParseResult(false, null, ['Invalid RDL: no <Report> root element']);
      }

      const dataSources = this.extractDataSources(report, warnings);
      const { measures, dimensions } = this.extractDataSets(report, warnings);
      const filters = this.extractParameters(report);
      const pages = this.extractBody(report, warnings);

      const title = report.Description ?? report['@_Name'] ?? 'SSRS Report';

      const dashboard = createDashboard({
        title,
        sourceFormat: 'rdl',
        dataSources,
        measures,
        dimensions,
        pages,
        filters,
        mode: 'snapshot',
        metadata: {
          reportWidth: report.Width ?? '',
          pageHeight: report.Page?.PageHeight ?? '',
          pageWidth: report.Page?.PageWidth ?? '',
          author: report.Author ?? '',
        },
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

  private extractDataSources(report: any, warnings: string[]): DataSourceSpec[] {
    const sources: DataSourceSpec[] = [];
    const rawSources = this.toArray(report.DataSources?.DataSource);

    for (const ds of rawSources) {
      const name = ds['@_Name'] ?? ds.Name ?? 'Unknown';
      const connProps = ds.ConnectionProperties;
      const connString = connProps?.ConnectString ?? '';
      const dataProvider = (connProps?.DataProvider ?? '').toLowerCase();

      sources.push({
        name,
        type: this.mapProvider(dataProvider),
        connectionString: connString,
        query: '',
        tables: [],
      });
    }

    return sources;
  }

  private extractDataSets(report: any, warnings: string[]): { measures: MeasureSpec[]; dimensions: DimensionSpec[] } {
    const measures: MeasureSpec[] = [];
    const dimensions: DimensionSpec[] = [];
    const dataSets = this.toArray(report.DataSets?.DataSet);

    for (const ds of dataSets) {
      const dataSetName = ds['@_Name'] ?? '';
      const query = ds.Query;
      const commandText = query?.CommandText ?? '';
      const fields = this.toArray(ds.Fields?.Field);

      for (const field of fields) {
        const fieldName = field['@_Name'] ?? '';
        const dataField = field.DataField ?? fieldName;
        const typeName = (field.TypeName ?? field.rd?.TypeName ?? '').toLowerCase();

        if (this.isNumericType(typeName)) {
          measures.push({
            name: fieldName,
            expression: dataField,
            sqlEquivalent: `SUM(${dataField})`,
            description: `From dataset ${dataSetName}`,
            formatString: '#,##0',
            dataType: typeName || 'numeric',
          });
        } else {
          dimensions.push({
            name: fieldName,
            sourceColumn: dataField,
            dataType: typeName || 'string',
            hierarchy: '',
          });
        }
      }

      // Extract table references from SQL
      if (commandText) {
        const tableMatches = commandText.matchAll(/\bFROM\s+[\[\]]*(\w+)/gi);
        for (const m of tableMatches) {
          const tableName = m[1];
          if (!dimensions.find((d) => d.name === `_table_${tableName}`)) {
            dimensions.push({
              name: `_table_${tableName}`,
              sourceColumn: tableName,
              dataType: 'table_ref',
              hierarchy: dataSetName,
            });
          }
        }
      }
    }

    return { measures, dimensions };
  }

  private extractParameters(report: any): FilterSpec[] {
    const filters: FilterSpec[] = [];
    const params = this.toArray(report.ReportParameters?.ReportParameter);

    for (const param of params) {
      const name = param['@_Name'] ?? '';
      const dataType = param.DataType ?? 'String';
      const multiValue = param.MultiValue === true || param.MultiValue === 'true';
      const validValues = this.toArray(param.ValidValues?.ParameterValues?.ParameterValue);
      const defaultValues = this.toArray(param.DefaultValue?.Values?.Value);

      filters.push({
        field: name,
        operator: multiValue ? 'in' : 'equals',
        values: defaultValues.length > 0
          ? defaultValues
          : validValues.map((v: any) => v.Value ?? v.Label ?? ''),
        isSlicer: true,
      });
    }

    return filters;
  }

  private extractBody(report: any, warnings: string[]): PageSpec[] {
    const pages: PageSpec[] = [];
    const body = report.Body;
    if (!body) {
      warnings.push('No Body element found in RDL');
      return pages;
    }

    const charts: ChartSpec[] = [];
    const items = this.toArray(body.ReportItems?.ReportItem ?? body.ReportItems);
    this.walkReportItems(items, charts, warnings, 0);

    // Also check for items directly in Body
    this.extractFromContainer(body, charts, warnings);

    if (charts.length > 0) {
      pages.push({ name: 'Report', charts, filters: [] });
    }

    return pages;
  }

  private extractFromContainer(container: any, charts: ChartSpec[], warnings: string[]): void {
    // Tablix elements
    const tablixes = this.toArray(container.Tablix ?? container.ReportItems?.Tablix);
    for (let i = 0; i < tablixes.length; i++) {
      const tablix = tablixes[i];
      const name = tablix['@_Name'] ?? `Tablix_${i}`;
      const columns: string[] = [];

      const members = this.toArray(
        tablix.TablixColumnHierarchy?.TablixMembers?.TablixMember
      );
      for (const member of members) {
        const header = member.Header?.CellContents?.Textbox?.Paragraphs?.Paragraph?.TextRuns?.TextRun?.Value;
        if (header) columns.push(String(header));
      }

      charts.push(
        createChart({
          id: `ssrs_tablix_${i}`,
          title: name,
          chartType: 'table',
          dimensions: columns,
          row: i * 4,
          col: 0,
          width: 12,
          height: 4,
        })
      );
    }

    // Chart elements
    const chartElements = this.toArray(container.Chart ?? container.ReportItems?.Chart);
    for (let i = 0; i < chartElements.length; i++) {
      const chart = chartElements[i];
      const name = chart['@_Name'] ?? `Chart_${i}`;
      const chartArea = chart.ChartAreas?.ChartArea;
      const chartType = this.getChartType(chart);

      const seriesNames: string[] = [];
      const series = this.toArray(chart.ChartData?.ChartSeriesCollection?.ChartSeries);
      for (const s of series) {
        seriesNames.push(s['@_Name'] ?? '');
      }

      const catNames: string[] = [];
      const categories = this.toArray(chart.ChartCategoryHierarchy?.ChartMembers?.ChartMember);
      for (const cat of categories) {
        const label = cat.Label ?? '';
        if (label) catNames.push(label);
      }

      charts.push(
        createChart({
          id: `ssrs_chart_${i}`,
          title: name,
          chartType,
          measures: seriesNames.filter(Boolean),
          dimensions: catNames,
          row: (tablixes?.length ?? 0) * 4 + i * 4,
          col: 0,
          width: 8,
          height: 4,
        })
      );
    }

    // Gauge panels
    const gaugePanels = this.toArray(container.GaugePanel ?? container.ReportItems?.GaugePanel);
    for (let i = 0; i < gaugePanels.length; i++) {
      const panel = gaugePanels[i];
      charts.push(
        createChart({
          id: `ssrs_gauge_${i}`,
          title: panel['@_Name'] ?? `Gauge ${i + 1}`,
          chartType: 'gauge',
        })
      );
    }
  }

  private walkReportItems(items: any[], charts: ChartSpec[], warnings: string[], depth: number): void {
    if (depth > 5) return;
    for (const item of items) {
      if (typeof item === 'object' && item !== null) {
        this.extractFromContainer(item, charts, warnings);
        // Recurse into rectangles or sub-containers
        const subItems = this.toArray(item.ReportItems);
        if (subItems.length > 0) {
          this.walkReportItems(subItems, charts, warnings, depth + 1);
        }
      }
    }
  }

  private getChartType(chart: any): ChartType {
    const series = this.toArray(chart.ChartData?.ChartSeriesCollection?.ChartSeries);
    if (series.length > 0) {
      const type = series[0].Type ?? series[0].ChartType ?? '';
      return SSRS_CHART_MAP[type] ?? 'bar';
    }
    return 'bar';
  }

  private mapProvider(provider: string): DataSourceSpec['type'] {
    if (provider.includes('sqlclient') || provider.includes('sql')) return 'mssql';
    if (provider.includes('oracle')) return 'oracle';
    if (provider.includes('mysql')) return 'mysql';
    if (provider.includes('postgres') || provider.includes('npgsql')) return 'postgres';
    if (provider.includes('odbc')) return 'mssql';
    return 'mssql';
  }

  private isNumericType(typeName: string): boolean {
    const numericTypes = ['int', 'integer', 'decimal', 'float', 'double', 'money', 'numeric', 'bigint', 'smallint', 'tinyint', 'real'];
    return numericTypes.some((t) => typeName.includes(t));
  }

  private toArray(val: any): any[] {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }
}


