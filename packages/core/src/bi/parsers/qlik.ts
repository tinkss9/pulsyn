// @ts-nocheck
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
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

interface QvdField {
  name: string;
  type: string;
  noOfSymbols: number;
}

interface QvsStatement {
  type: 'LOAD' | 'SELECT' | 'SET' | 'LET' | 'STORE';
  tableName: string;
  fields: string[];
  source: string;
}

export class QlikParser {
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
  });

  async parse(fileBuffer: Buffer): Promise<ParseResult> {
    const start = Date.now();
    const warnings: string[] = [];

    try {
      const content = fileBuffer.toString('utf-8');
      const header = fileBuffer.slice(0, 4).toString('hex');

      // Detect file type
      if (this.isQvd(content)) {
        return this.parseQvd(fileBuffer, start, warnings);
      } else if (header === '504b0304') {
        return this.parseQvfZip(fileBuffer, start, warnings);
      } else {
        return this.parseQvs(content, start, warnings);
      }
    } catch (e) {
      const result = createParseResult(false, null, [(e as Error).message]);
      result.parseDurationMs = Date.now() - start;
      return result;
    }
  }

  private isQvd(content: string): boolean {
    return content.trimStart().startsWith('<?xml') && content.includes('<QvdTableHeader>');
  }

  private async parseQvd(fileBuffer: Buffer, start: number, warnings: string[]): Promise<ParseResult> {
    const content = fileBuffer.toString('utf-8');
    // QVD files have XML header followed by binary data
    const xmlEnd = content.indexOf('</QvdTableHeader>');
    if (xmlEnd === -1) {
      return createParseResult(false, null, ['Invalid QVD: no QvdTableHeader found']);
    }

    const xmlSection = content.substring(0, xmlEnd + '</QvdTableHeader>'.length);
    const parsed = this.xmlParser.parse(xmlSection);
    const header = parsed.QvdTableHeader;

    const tableName = header.TableName ?? 'QVD_Table';
    const noOfRecords = header.NoOfRecords ?? 0;
    const fields = this.extractQvdFields(header);

    const dimensions: DimensionSpec[] = [];
    const measures: MeasureSpec[] = [];

    for (const field of fields) {
      if (this.isNumericField(field)) {
        measures.push({
          name: field.name,
          expression: field.name,
          sqlEquivalent: `SUM(${field.name})`,
          description: `${field.noOfSymbols} distinct values`,
          formatString: '#,##0',
          dataType: field.type,
        });
      } else {
        dimensions.push({
          name: field.name,
          sourceColumn: field.name,
          dataType: field.type,
          hierarchy: '',
        });
      }
    }

    const pages: PageSpec[] = [{
      name: tableName,
      charts: [
        createChart({
          id: 'qvd_table_0',
          title: `${tableName} (${noOfRecords.toLocaleString()} rows)`,
          chartType: 'table',
          dimensions: dimensions.map((d) => d.name),
          measures: measures.map((m) => m.name),
        }),
      ],
      filters: [],
    }];

    const dataSources: DataSourceSpec[] = [{
      name: tableName,
      type: 'embedded',
      connectionString: '',
      query: '',
      tables: [tableName],
    }];

    const dashboard = createDashboard({
      title: `QVD: ${tableName}`,
      sourceFormat: 'qvd',
      dataSources,
      measures,
      dimensions,
      pages,
      mode: 'snapshot',
      metadata: { noOfRecords, fieldCount: fields.length },
      warnings,
    });

    const result = createParseResult(true, dashboard);
    result.parseDurationMs = Date.now() - start;
    return result;
  }

  private async parseQvfZip(fileBuffer: Buffer, start: number, warnings: string[]): Promise<ParseResult> {
    const zip = await JSZip.loadAsync(fileBuffer);
    const dimensions: DimensionSpec[] = [];
    const measures: MeasureSpec[] = [];
    const pages: PageSpec[] = [];

    // QVF is a zip with JSON definitions
    const appPropsFile = zip.file('AppProperties');
    let title = 'Qlik App';
    if (appPropsFile) {
      try {
        const props = JSON.parse(await appPropsFile.async('string'));
        title = props.qTitle ?? title;
      } catch {
        warnings.push('Could not parse AppProperties');
      }
    }

    // Look for script files inside
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.endsWith('.qvs') || filename.includes('script')) {
        const scriptContent = await file.async('string');
        const statements = this.parseQvsStatements(scriptContent);
        this.processStatements(statements, dimensions, measures);
      }
    }

    if (dimensions.length > 0 || measures.length > 0) {
      pages.push({
        name: 'Data Model',
        charts: [
          createChart({
            id: 'qvf_model_0',
            title: 'Extracted Data Model',
            chartType: 'table',
            dimensions: dimensions.map((d) => d.name),
            measures: measures.map((m) => m.name),
          }),
        ],
        filters: [],
      });
    }

    const dashboard = createDashboard({
      title,
      sourceFormat: 'qvf',
      measures,
      dimensions,
      pages,
      mode: 'snapshot',
      warnings,
    });

    const result = createParseResult(true, dashboard);
    result.parseDurationMs = Date.now() - start;
    return result;
  }

  private parseQvs(content: string, start: number, warnings: string[]): ParseResult {
    const statements = this.parseQvsStatements(content);
    const dimensions: DimensionSpec[] = [];
    const measures: MeasureSpec[] = [];
    const dataSources: DataSourceSpec[] = [];

    this.processStatements(statements, dimensions, measures);

    // Extract connection info from statements
    for (const stmt of statements) {
      if (stmt.source && !dataSources.find((ds) => ds.name === stmt.source)) {
        dataSources.push({
          name: stmt.source,
          type: this.inferSourceType(stmt.source),
          connectionString: stmt.source,
          query: stmt.fields.length > 0 ? `SELECT ${stmt.fields.join(', ')} FROM ${stmt.tableName}` : '',
          tables: [stmt.tableName].filter(Boolean),
        });
      }
    }

    const pages: PageSpec[] = [];
    const loadStmts = statements.filter((s) => s.type === 'LOAD' || s.type === 'SELECT');
    for (let i = 0; i < loadStmts.length; i++) {
      const stmt = loadStmts[i];
      pages.push({
        name: stmt.tableName || `Query ${i + 1}`,
        charts: [
          createChart({
            id: `qvs_load_${i}`,
            title: stmt.tableName || `Load Statement ${i + 1}`,
            chartType: 'table',
            dimensions: stmt.fields.filter((f) => !this.looksNumeric(f)),
            measures: stmt.fields.filter((f) => this.looksNumeric(f)),
          }),
        ],
        filters: [],
      });
    }

    const dashboard = createDashboard({
      title: 'Qlik Script',
      sourceFormat: 'qvs',
      dataSources,
      measures,
      dimensions,
      pages,
      mode: 'snapshot',
      metadata: { statementCount: statements.length },
      warnings,
    });

    const result = createParseResult(true, dashboard);
    result.parseDurationMs = Date.now() - start;
    return result;
  }

  private parseQvsStatements(content: string): QvsStatement[] {
    const statements: QvsStatement[] = [];

    // SET/LET statements
    const setMatches = content.matchAll(/\b(SET|LET)\s+(\w+)\s*=\s*(.+?);/gi);
    for (const m of setMatches) {
      statements.push({
        type: m[1].toUpperCase() as 'SET' | 'LET',
        tableName: m[2],
        fields: [m[3].trim()],
        source: '',
      });
    }

    // LOAD statements
    const loadMatches = content.matchAll(
      /(\w+):\s*\n?\s*LOAD\s+([\s\S]*?)\s+FROM\s+\[?([^\];\n]+)\]?/gi
    );
    for (const m of loadMatches) {
      const fields = m[2]
        .split(/,\s*\n?\s*/)
        .map((f) => f.trim().replace(/\s+as\s+\w+/i, ''))
        .filter(Boolean);
      statements.push({
        type: 'LOAD',
        tableName: m[1],
        fields,
        source: m[3].trim(),
      });
    }

    // SELECT statements
    const selectMatches = content.matchAll(
      /(\w+):\s*\n?\s*SQL\s+SELECT\s+([\s\S]*?)\s+FROM\s+(\w+)/gi
    );
    for (const m of selectMatches) {
      const fields = m[2].split(/,\s*/).map((f) => f.trim()).filter(Boolean);
      statements.push({
        type: 'SELECT',
        tableName: m[1],
        fields,
        source: m[3].trim(),
      });
    }

    return statements;
  }

  private processStatements(statements: QvsStatement[], dimensions: DimensionSpec[], measures: MeasureSpec[]): void {
    for (const stmt of statements) {
      if (stmt.type !== 'LOAD' && stmt.type !== 'SELECT') continue;
      for (const field of stmt.fields) {
        const cleanField = field.replace(/["'`]/g, '');
        if (this.looksNumeric(cleanField)) {
          if (!measures.find((m) => m.name === cleanField)) {
            measures.push({
              name: cleanField,
              expression: cleanField,
              sqlEquivalent: `SUM(${cleanField})`,
              description: `From ${stmt.tableName}`,
              formatString: '#,##0',
              dataType: 'numeric',
            });
          }
        } else {
          if (!dimensions.find((d) => d.name === cleanField)) {
            dimensions.push({
              name: cleanField,
              sourceColumn: cleanField,
              dataType: 'string',
              hierarchy: '',
            });
          }
        }
      }
    }
  }

  private extractQvdFields(header: any): QvdField[] {
    const fields: QvdField[] = [];
    const rawFields = header.Fields?.QvdFieldHeader;
    if (!rawFields) return fields;

    const fieldArray = Array.isArray(rawFields) ? rawFields : [rawFields];
    for (const f of fieldArray) {
      fields.push({
        name: f.FieldName ?? 'Unknown',
        type: this.mapQvdType(f.NumberFormat?.Type ?? 'UNKNOWN'),
        noOfSymbols: f.NoOfSymbols ?? 0,
      });
    }
    return fields;
  }

  private isNumericField(field: QvdField): boolean {
    return ['numeric', 'integer', 'real', 'money', 'fix'].includes(field.type);
  }

  private mapQvdType(type: string): string {
    const map: Record<string, string> = {
      REAL: 'numeric', FIX: 'numeric', MONEY: 'numeric',
      INTEGER: 'integer', DATE: 'date', TIMESTAMP: 'timestamp',
      ASCII: 'string', UNKNOWN: 'string',
    };
    return map[type.toUpperCase()] ?? 'string';
  }

  private looksNumeric(field: string): boolean {
    const numericIndicators = ['amount', 'total', 'sum', 'count', 'qty', 'quantity', 'price', 'cost', 'revenue', 'profit', 'num', 'avg'];
    const lower = field.toLowerCase();
    return numericIndicators.some((ind) => lower.includes(ind));
  }

  private inferSourceType(source: string): DataSourceSpec['type'] {
    const lower = source.toLowerCase();
    if (lower.includes('.csv')) return 'csv';
    if (lower.includes('.xls')) return 'excel';
    if (lower.includes('.qvd')) return 'embedded';
    if (lower.includes('odbc') || lower.includes('oledb')) return 'mssql';
    return 'embedded';
  }
}


