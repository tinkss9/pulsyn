// @ts-nocheck
import ExcelJS from 'exceljs';
import {
  ChartType,
  DataSourceSpec,
  DimensionSpec,
  MeasureSpec,
  PageSpec,
  ParseResult,
  createDashboard,
  createChart,
  createParseResult,
} from '../models';

const EXCEL_CHART_MAP: Record<string, ChartType> = {
  bar: 'bar',
  bar3D: 'bar',
  col: 'bar',
  col3D: 'bar',
  line: 'line',
  line3D: 'line',
  area: 'area',
  area3D: 'area',
  pie: 'pie',
  pie3D: 'pie',
  doughnut: 'pie',
  scatter: 'scatter',
  bubble: 'scatter',
  radar: 'area',
  stock: 'combo',
  surface: 'heatmap',
  surface3D: 'heatmap',
  ofPie: 'pie',
};

export class ExcelParser {
  async parse(fileBuffer: Buffer): Promise<ParseResult> {
    const start = Date.now();
    const warnings: string[] = [];

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);

      const measures = this.extractFormulas(workbook, warnings);
      const dimensions = this.extractNamedRanges(workbook);
      const pages = this.extractPages(workbook, warnings);
      const dataSources = this.detectDataSources(workbook);

      const dashboard = createDashboard({
        title: workbook.creator
          ? `Excel Workbook by ${workbook.creator}`
          : 'Excel Workbook',
        sourceFormat: 'xlsx',
        dataSources,
        measures,
        dimensions,
        pages,
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

  private extractFormulas(workbook: ExcelJS.Workbook, warnings: string[]): MeasureSpec[] {
    const measures: MeasureSpec[] = [];
    const seen = new Set<string>();

    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          if (cell.type === ExcelJS.ValueType.Formula && cell.formula) {
            const formula = cell.formula;
            const key = `${sheet.name}!${cell.address}`;
            if (seen.has(key)) return;
            seen.add(key);

            const funcMatch = formula.match(/^(\w+)\(/);
            const funcName = funcMatch ? funcMatch[1].toUpperCase() : 'CALC';
            const isAggregate = ['SUM', 'AVERAGE', 'COUNT', 'COUNTA', 'MIN', 'MAX', 'SUMIF', 'COUNTIF', 'AVERAGEIF'].includes(funcName);

            if (isAggregate) {
              measures.push({
                name: `${sheet.name}_${cell.address}_${funcName}`,
                expression: formula,
                sqlEquivalent: this.excelFormulaToSql(formula),
                description: `${funcName} formula at ${sheet.name}!${cell.address}`,
                formatString: this.inferFormat(cell),
                dataType: 'numeric',
              });
            }
          }
        });
      });
    });

    return measures;
  }

  private extractNamedRanges(workbook: ExcelJS.Workbook): DimensionSpec[] {
    const dimensions: DimensionSpec[] = [];

    for (const name of (workbook as any).definedNames?.model ?? []) {
      dimensions.push({
        name: name.name ?? 'Unknown',
        sourceColumn: name.ranges?.[0] ?? '',
        dataType: 'string',
        hierarchy: '',
      });
    }

    return dimensions;
  }

  private extractPages(workbook: ExcelJS.Workbook, warnings: string[]): PageSpec[] {
    const pages: PageSpec[] = [];

    workbook.eachSheet((sheet) => {
      const charts: any[] = [];
      const images = (sheet as any).getImages?.() ?? [];
      const sheetCharts = (sheet as any)._charts ?? (sheet as any).charts ?? [];

      if (Array.isArray(sheetCharts)) {
        for (let i = 0; i < sheetCharts.length; i++) {
          const chart = sheetCharts[i];
          const chartType = this.mapChartType(chart.type ?? chart.plotArea?.chartType ?? '');
          const title = chart.title?.text ?? chart.title ?? '';
          const seriesNames = (chart.series ?? []).map((s: any) => s.name ?? `Series ${i}`);

          charts.push(
            createChart({
              id: `${sheet.name}_chart_${i}`,
              title: typeof title === 'string' ? title : `Chart ${i + 1}`,
              chartType,
              measures: seriesNames,
              dimensions: chart.categories ? [chart.categories.toString()] : [],
            })
          );
        }
      }

      // Detect table-like structures if no charts found
      if (charts.length === 0 && sheet.rowCount > 1) {
        const headerRow = sheet.getRow(1);
        const headers: string[] = [];
        headerRow.eachCell((cell) => {
          if (cell.value) headers.push(String(cell.value));
        });

        if (headers.length >= 2 && sheet.rowCount >= 3) {
          charts.push(
            createChart({
              id: `${sheet.name}_table_0`,
              title: `${sheet.name} Data Table`,
              chartType: 'table',
              dimensions: headers,
            })
          );
        }
      }

      if (charts.length > 0) {
        pages.push({ name: sheet.name, charts, filters: [] });
      }
    });

    return pages;
  }

  private detectDataSources(workbook: ExcelJS.Workbook): DataSourceSpec[] {
    const sources: DataSourceSpec[] = [];
    const tables: string[] = [];

    workbook.eachSheet((sheet) => {
      if (sheet.rowCount > 1) {
        tables.push(sheet.name);
      }
    });

    if (tables.length > 0) {
      sources.push({
        name: 'Embedded Excel Data',
        type: 'excel',
        connectionString: '',
        query: '',
        tables,
      });
    }

    return sources;
  }

  private mapChartType(excelType: string): ChartType {
    const lower = excelType.toLowerCase();
    for (const [key, value] of Object.entries(EXCEL_CHART_MAP)) {
      if (lower.includes(key.toLowerCase())) return value;
    }
    return 'bar';
  }

  private excelFormulaToSql(formula: string): string {
    return formula
      .replace(/SUMIF\(([^,]+),([^,]+),([^)]+)\)/i, 'SUM(CASE WHEN $1=$2 THEN $3 END)')
      .replace(/COUNTIF\(([^,]+),([^)]+)\)/i, 'COUNT(CASE WHEN $1=$2 THEN 1 END)')
      .replace(/AVERAGEIF\(([^,]+),([^,]+),([^)]+)\)/i, 'AVG(CASE WHEN $1=$2 THEN $3 END)')
      .replace(/SUM\(([^)]+)\)/i, 'SUM($1)')
      .replace(/AVERAGE\(([^)]+)\)/i, 'AVG($1)')
      .replace(/COUNT\(([^)]+)\)/i, 'COUNT($1)')
      .replace(/COUNTA\(([^)]+)\)/i, 'COUNT($1)')
      .replace(/MIN\(([^)]+)\)/i, 'MIN($1)')
      .replace(/MAX\(([^)]+)\)/i, 'MAX($1)');
  }

  private inferFormat(cell: any): string {
    const numFmt = cell.numFmt ?? cell.style?.numFmt ?? '';
    if (numFmt.includes('%')) return '0.0%';
    if (numFmt.includes('$') || numFmt.includes('£')) return '$#,##0.00';
    return '#,##0';
  }
}

