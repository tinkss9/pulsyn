// @ts-nocheck
import pdfParse from 'pdf-parse';
import {
  ChartSpec,
  DataSourceSpec,
  MeasureSpec,
  PageSpec,
  ParseResult,
  createDashboard,
  createChart,
  createParseResult,
} from '../models';

interface DetectedTable {
  headers: string[];
  rows: string[][];
  pageIndex: number;
}

export class PDFParser {
  async parse(fileBuffer: Buffer): Promise<ParseResult> {
    const start = Date.now();
    const warnings: string[] = [];

    try {
      const pdfData = await pdfParse(fileBuffer);
      const pageTexts = this.splitPages(pdfData.text, pdfData.numpages);
      const pages: PageSpec[] = [];
      const allMeasures: MeasureSpec[] = [];

      for (let i = 0; i < pageTexts.length; i++) {
        const pageText = pageTexts[i];
        const tables = this.detectTables(pageText, i);
        const charts: ChartSpec[] = [];

        for (let t = 0; t < tables.length; t++) {
          const table = tables[t];
          const numericCols = this.findNumericColumns(table);

          charts.push(
            createChart({
              id: `pdf_page${i}_table${t}`,
              title: this.inferTableTitle(pageText, table) || `Table ${t + 1}`,
              chartType: 'table',
              dimensions: table.headers.filter((_, idx) => !numericCols.has(idx)),
              measures: table.headers.filter((_, idx) => numericCols.has(idx)),
              row: t * 4,
              col: 0,
              width: 12,
              height: Math.min(table.rows.length + 1, 8),
            })
          );

          for (const colIdx of numericCols) {
            const header = table.headers[colIdx];
            if (header && !allMeasures.find((m) => m.name === header)) {
              allMeasures.push({
                name: header,
                expression: header,
                sqlEquivalent: `SUM(${header})`,
                description: `Numeric column from PDF table`,
                formatString: '#,##0',
                dataType: 'numeric',
              });
            }
          }
        }

        // If no tables detected, check for KPI-like values
        if (tables.length === 0) {
          const kpis = this.detectKPIs(pageText);
          for (let k = 0; k < kpis.length; k++) {
            charts.push(
              createChart({
                id: `pdf_page${i}_kpi${k}`,
                title: kpis[k].label,
                chartType: 'kpi',
                measures: [kpis[k].label],
                row: 0,
                col: k * 3,
                width: 3,
                height: 2,
              })
            );
            allMeasures.push({
              name: kpis[k].label,
              expression: kpis[k].value,
              sqlEquivalent: kpis[k].label,
              description: `KPI extracted from PDF page ${i + 1}`,
              formatString: '#,##0',
              dataType: 'numeric',
            });
          }
        }

        if (charts.length > 0) {
          pages.push({ name: `Page ${i + 1}`, charts, filters: [] });
        }
      }

      if (pages.length === 0) {
        warnings.push('No structured data detected in PDF; content may be image-based');
      }

      const dataSources: DataSourceSpec[] = [{
        name: 'PDF Document',
        type: 'embedded',
        connectionString: '',
        query: '',
        tables: pages.map((p) => p.name),
      }];

      const dashboard = createDashboard({
        title: pdfData.info?.Title ?? 'PDF Report',
        sourceFormat: 'pdf',
        dataSources,
        measures: allMeasures,
        pages,
        mode: 'snapshot',
        metadata: {
          author: pdfData.info?.Author ?? '',
          pageCount: pdfData.numpages,
          creator: pdfData.info?.Creator ?? '',
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

  private splitPages(fullText: string, numPages: number): string[] {
    // pdf-parse separates pages with form feed or multiple newlines
    const pages = fullText.split(/\f/);
    if (pages.length >= numPages) return pages.slice(0, numPages);
    // Fallback: split by double-newline clusters
    const chunks = fullText.split(/\n{3,}/);
    if (chunks.length >= numPages) return chunks.slice(0, numPages);
    return [fullText];
  }

  private detectTables(pageText: string, pageIndex: number): DetectedTable[] {
    const tables: DetectedTable[] = [];
    const lines = pageText.split('\n').filter((l) => l.trim().length > 0);

    let tableStart = -1;
    let currentTable: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const columns = this.splitByAlignment(line);

      if (columns.length >= 2) {
        if (tableStart === -1) tableStart = i;
        currentTable.push(columns);
      } else {
        if (currentTable.length >= 3) {
          tables.push({
            headers: currentTable[0],
            rows: currentTable.slice(1),
            pageIndex,
          });
        }
        currentTable = [];
        tableStart = -1;
      }
    }

    if (currentTable.length >= 3) {
      tables.push({
        headers: currentTable[0],
        rows: currentTable.slice(1),
        pageIndex,
      });
    }

    return tables;
  }

  private splitByAlignment(line: string): string[] {
    // Detect columns by 2+ consecutive spaces or tab characters
    const parts = line.split(/\s{2,}|\t+/).map((p) => p.trim()).filter(Boolean);
    return parts;
  }

  private findNumericColumns(table: DetectedTable): Set<number> {
    const numericCols = new Set<number>();
    if (table.rows.length === 0) return numericCols;

    for (let col = 0; col < table.headers.length; col++) {
      let numericCount = 0;
      for (const row of table.rows) {
        const val = (row[col] ?? '').replace(/[$,£€%\s]/g, '');
        if (val && !isNaN(Number(val))) numericCount++;
      }
      if (numericCount >= table.rows.length * 0.6) {
        numericCols.add(col);
      }
    }
    return numericCols;
  }

  private inferTableTitle(pageText: string, table: DetectedTable): string {
    // Look for a bold-like text or heading above the table
    const lines = pageText.split('\n');
    const headerLine = table.headers.join(' ');
    const headerIdx = lines.findIndex((l) => l.includes(headerLine.substring(0, 20)));
    if (headerIdx > 0) {
      const candidate = lines[headerIdx - 1].trim();
      if (candidate.length > 2 && candidate.length < 80) return candidate;
    }
    return '';
  }

  private detectKPIs(pageText: string): { label: string; value: string }[] {
    const kpis: { label: string; value: string }[] = [];
    // Match patterns like "Revenue: $1,234,567" or "Total Users 45,000"
    const kpiPattern = /([A-Z][A-Za-z\s]+?)[:]\s*([\$£€]?[\d,]+\.?\d*%?)/g;
    let match: RegExpExecArray | null;

    while ((match = kpiPattern.exec(pageText)) !== null) {
      kpis.push({ label: match[1].trim(), value: match[2] });
      if (kpis.length >= 10) break;
    }

    return kpis;
  }
}

