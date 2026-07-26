// @ts-nocheck
export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'scatter'
  | 'area'
  | 'heatmap'
  | 'treemap'
  | 'gauge'
  | 'table'
  | 'kpi'
  | 'map'
  | 'funnel'
  | 'combo';

export type DataSourceType =
  | 'snowflake'
  | 'postgres'
  | 'mysql'
  | 'mssql'
  | 'oracle'
  | 'csv'
  | 'excel'
  | 'rest_api'
  | 'embedded';

export interface MeasureSpec {
  name: string;
  expression: string;
  sqlEquivalent: string;
  description: string;
  formatString: string;
  dataType: string;
}

export interface DimensionSpec {
  name: string;
  sourceColumn: string;
  dataType: string;
  hierarchy: string;
}

export interface FilterSpec {
  field: string;
  operator: string;
  values: any[];
  isSlicer: boolean;
}

export interface DataSourceSpec {
  name: string;
  type: DataSourceType;
  connectionString: string;
  query: string;
  tables: string[];
}

export interface ChartSpec {
  id: string;
  title: string;
  chartType: ChartType;
  measures: string[];
  dimensions: string[];
  filters: FilterSpec[];
  row: number;
  col: number;
  width: number;
  height: number;
  hierarchy: string[];
  crossFilterEnabled: boolean;
  liveQueryEnabled: boolean;
}

export interface PageSpec {
  name: string;
  charts: ChartSpec[];
  filters: FilterSpec[];
}

export interface DashboardDefinition {
  id: string;
  title: string;
  sourceFile: string;
  sourceFormat: string;
  createdAt: Date;
  dataSources: DataSourceSpec[];
  measures: MeasureSpec[];
  dimensions: DimensionSpec[];
  pages: PageSpec[];
  filters: FilterSpec[];
  mode: 'snapshot' | 'connected' | 'realtime';
  hierarchies: Record<string, string[]>;
  metadata: Record<string, any>;
  warnings: string[];
}

export interface ParseResult {
  success: boolean;
  dashboard: DashboardDefinition | null;
  errors: string[];
  warnings: string[];
  parseDurationMs: number;
}

export function createDashboard(
  partial: Partial<DashboardDefinition> & { title: string }
): DashboardDefinition {
  return {
    id: partial.id ?? crypto.randomUUID(),
    title: partial.title,
    sourceFile: partial.sourceFile ?? '',
    sourceFormat: partial.sourceFormat ?? 'unknown',
    createdAt: partial.createdAt ?? new Date(),
    dataSources: partial.dataSources ?? [],
    measures: partial.measures ?? [],
    dimensions: partial.dimensions ?? [],
    pages: partial.pages ?? [],
    filters: partial.filters ?? [],
    mode: partial.mode ?? 'snapshot',
    hierarchies: partial.hierarchies ?? {},
    metadata: partial.metadata ?? {},
    warnings: partial.warnings ?? [],
  };
}

export function createChart(
  partial: Partial<ChartSpec> & { id: string; chartType: ChartType }
): ChartSpec {
  return {
    id: partial.id,
    title: partial.title ?? '',
    chartType: partial.chartType,
    measures: partial.measures ?? [],
    dimensions: partial.dimensions ?? [],
    filters: partial.filters ?? [],
    row: partial.row ?? 0,
    col: partial.col ?? 0,
    width: partial.width ?? 6,
    height: partial.height ?? 4,
    hierarchy: partial.hierarchy ?? [],
    crossFilterEnabled: partial.crossFilterEnabled ?? false,
    liveQueryEnabled: partial.liveQueryEnabled ?? false,
  };
}

export function createParseResult(
  success: boolean,
  dashboard?: DashboardDefinition | null,
  errors?: string[]
): ParseResult {
  return {
    success,
    dashboard: dashboard ?? null,
    errors: errors ?? [],
    warnings: dashboard?.warnings ?? [],
    parseDurationMs: 0,
  };
}

