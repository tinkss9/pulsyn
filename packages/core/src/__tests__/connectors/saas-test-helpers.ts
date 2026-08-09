// SaaS Connector Test Helpers
// Shared utilities for testing SaaS API connectors (Stripe, Salesforce, HubSpot, etc.)
// Provides mock fetch setup, assertion helpers, and env-key gating for live vs mocked tests.

import { vi, expect, beforeEach, afterEach } from 'vitest';
import type { BaseConnector } from '../../connectors/base';
import type { DatabaseConfig, TableSchema } from '../../types';
import type { UnifiedChangeEvent } from '../../events';

// ─── Mock Fetch Infrastructure ──────────────────────────────────────────────

export interface MockRoute {
  method: string;
  path: string | RegExp;
  handler: (url: string, init?: RequestInit) => any;
}

let mockRoutes: MockRoute[] = [];
let fetchSpy: ReturnType<typeof vi.fn> | null = null;

/** Register a mock HTTP route. Call in beforeEach or at test scope. */
export function mockRoute(method: string, path: string | RegExp, handler: (url: string, init?: RequestInit) => any) {
  mockRoutes.push({ method: method.toUpperCase(), path, handler });
}

/** Clear all registered mock routes. */
export function clearMockRoutes() {
  mockRoutes = [];
}

/** Build a mock Response object. */
export function mockResponse(body: any, status = 200, statusText = 'OK'): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    bytes: () => Promise.resolve(new Uint8Array()),
    clone: () => mockResponse(body, status, statusText),
    formData: () => Promise.resolve(new FormData()),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
  } as unknown as Response;
}

/** Install global fetch mock. Returns the spy for assertions. */
export function installFetchMock(): ReturnType<typeof vi.fn> {
  fetchSpy = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    const method = (init?.method || 'GET').toUpperCase();

    for (const route of mockRoutes) {
      if (route.method !== method) continue;
      const matches = typeof route.path === 'string'
        ? urlStr.includes(route.path)
        : route.path.test(urlStr);
      if (matches) return route.handler(urlStr, init);
    }

    return mockResponse({ error: `No mock for ${method} ${urlStr}` }, 404, 'Not Found');
  });
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

/** Uninstall global fetch mock. */
export function uninstallFetchMock() {
  vi.restoreAllMocks();
  fetchSpy = null;
  mockRoutes = [];
}

// ─── SaaS Test Suite Generator ──────────────────────────────────────────────

export interface SaaSConnectorTestConfig {
  /** Connector class constructor */
  ConnectorClass: new (id: string, name: string, engine: string, config: DatabaseConfig) => BaseConnector;
  /** Connector engine name (must match registry) */
  engine: string;
  /** Human-readable name */
  displayName: string;
  /** Config to pass when env key is NOT set (uses mock) */
  mockConfig: DatabaseConfig;
  /** Env var name for the real API key */
  envKey: string;
  /** Build real config from the API key */
  buildRealConfig: (key: string) => DatabaseConfig;
  /** Expected table names (from getTables) */
  expectedTables: string[];
  /** Tables to test extractFull against */
  extractTables: string[];
  /** Expected columns per table for schema validation */
  schemaExpectations: Record<string, string[]>;
  /** Setup mock HTTP routes for this connector */
  setupMocks: () => void;
  /** Optional: custom connect assertion (e.g., OAuth token exchange) */
  customConnectTest?: (connector: BaseConnector) => Promise<void>;
  /** Min rows expected from extractFull (for live tests) */
  minExtractRows?: number;
}

/**
 * Creates a dual-mode test suite for a SaaS connector.
 * - When env key is missing: runs with mocked fetch (CI/CD safe)
 * - When env key is set: runs against real API (integration/certification)
 */
export function createSaaSTestSuite(config: SaaSConnectorTestConfig) {
  const hasRealKey = !!process.env[config.envKey];
  const describeFn = hasRealKey ? describe : describe;
  const itLive = hasRealKey ? it : it.skip;
  const itMock = hasRealKey ? it.skip : it;

  return { hasRealKey, describeFn, itLive, itMock, config };
}

// ─── Common SaaS Assertions ─────────────────────────────────────────────────

/** Assert connector connects successfully. */
export async function assertConnect(connector: BaseConnector, cfg: DatabaseConfig): Promise<void> {
  await connector.connect(cfg);
  expect(connector.isConnected()).toBe(true);
}

/** Assert connector rejects missing credentials. */
export async function assertConnectRejectsNoCreds(
  ConnectorClass: new (...args: any[]) => BaseConnector,
  engine: string
): Promise<void> {
  const c = new ConnectorClass('test', 'test', engine, {} as DatabaseConfig);
  await expect(c.connect({} as DatabaseConfig)).rejects.toThrow();
}

/** Assert getTables returns expected list. */
export async function assertGetTables(connector: BaseConnector, expected: string[]): Promise<string[]> {
  const tables = await connector.getTables();
  expect(Array.isArray(tables)).toBe(true);
  for (const t of expected) {
    expect(tables).toContain(t);
  }
  return tables;
}

/** Assert getTableSchema returns valid schema with expected columns. */
export async function assertGetTableSchema(
  connector: BaseConnector,
  table: string,
  expectedColumns: string[]
): Promise<TableSchema> {
  const schema = await connector.getTableSchema(table);
  expect(schema).toBeDefined();
  expect(schema.table).toBe(table);
  expect(Array.isArray(schema.columns)).toBe(true);
  expect(schema.primaryKeys.length).toBeGreaterThan(0);
  const colNames = schema.columns.map(c => c.name);
  for (const col of expectedColumns) {
    expect(colNames).toContain(col);
  }
  return schema;
}

/** Assert extractFull returns valid events. */
export async function assertExtractFull(
  connector: BaseConnector,
  table: string,
  minRows: number = 1
): Promise<UnifiedChangeEvent[]> {
  const events = await connector.extractFull(table);
  expect(Array.isArray(events)).toBe(true);
  expect(events.length).toBeGreaterThanOrEqual(minRows);
  for (const evt of events) {
    expect(evt.op).toBe('S');
    expect(evt.table).toBe(table);
    expect(evt.after).toBeDefined();
  }
  return events;
}

/** Assert disconnect works cleanly. */
export async function assertDisconnect(connector: BaseConnector): Promise<void> {
  await connector.disconnect();
  expect(connector.isConnected()).toBe(false);
}

// ─── Mock Data Factories ────────────────────────────────────────────────────

export const MOCK_STRIPE_CUSTOMERS = {
  object: 'list',
  data: [
    { id: 'cus_test1', email: 'test@example.com', name: 'Test User', phone: null, description: null, balance: 0, currency: 'usd', created: 1700000000, delinquent: false, invoice_prefix: 'ABC' },
    { id: 'cus_test2', email: 'test2@example.com', name: 'Test User 2', phone: '+1234567890', description: 'A customer', balance: -500, currency: 'usd', created: 1700100000, delinquent: true, invoice_prefix: 'DEF' },
  ],
  has_more: false,
  url: '/v1/customers',
};

export const MOCK_STRIPE_CHARGES = {
  object: 'list',
  data: [
    { id: 'ch_test1', amount: 2000, currency: 'usd', customer: 'cus_test1', description: 'Test charge', status: 'succeeded', paid: true, refunded: false, disputed: false, created: 1700000000, payment_method: 'pm_test1', receipt_url: 'https://receipt.stripe.com/test' },
    { id: 'ch_test2', amount: 5000, currency: 'eur', customer: 'cus_test2', description: null, status: 'pending', paid: false, refunded: false, disputed: false, created: 1700100000, payment_method: null, receipt_url: null },
  ],
  has_more: false,
  url: '/v1/charges',
};

export const MOCK_STRIPE_INVOICES = {
  object: 'list',
  data: [
    { id: 'inv_test1', customer: 'cus_test1', amount_due: 2000, amount_paid: 2000, currency: 'usd', status: 'paid', period_start: 1700000000, period_end: 1700100000, created: 1700000000 },
    { id: 'inv_test2', customer: 'cus_test2', amount_due: 5000, amount_paid: 0, currency: 'usd', status: 'open', period_start: 1700100000, period_end: 1700200000, created: 1700100000 },
  ],
  has_more: false,
  url: '/v1/invoices',
};

export const MOCK_STRIPE_BALANCE = {
  available: [{ amount: 10000, currency: 'usd' }],
  pending: [{ amount: 5000, currency: 'usd' }],
  livemode: false,
};

export const MOCK_SALESFORCE_SOBJECTS = {
  sobjects: [
    { name: 'Account', queryable: true, retrieveable: true },
    { name: 'Contact', queryable: true, retrieveable: true },
    { name: 'Opportunity', queryable: true, retrieveable: true },
    { name: 'Lead', queryable: true, retrieveable: true },
    { name: 'Case', queryable: true, retrieveable: false },
  ],
};

export const MOCK_SALESFORCE_ACCOUNTS = {
  totalSize: 2,
  done: true,
  records: [
    { attributes: { type: 'Account', url: '/services/data/v60.0/sobjects/Account/001xx000003DGP0' }, Id: '001xx000003DGP0', Name: 'Acme Corp', Industry: 'Technology', Phone: '555-0100', Website: 'https://acme.com', CreatedDate: '2024-01-15T10:00:00Z', SystemModstamp: '2024-06-01T12:00:00Z' },
    { attributes: { type: 'Account', url: '/services/data/v60.0/sobjects/Account/001xx000003DGP1' }, Id: '001xx000003DGP1', Name: 'Globex Inc', Industry: 'Finance', Phone: '555-0200', Website: null, CreatedDate: '2024-02-20T14:00:00Z', SystemModstamp: '2024-07-10T09:00:00Z' },
  ],
};

export const MOCK_SALESFORCE_CONTACTS = {
  totalSize: 2,
  done: true,
  records: [
    { attributes: { type: 'Contact', url: '/services/data/v60.0/sobjects/Contact/003xx000004DGP0' }, Id: '003xx000004DGP0', FirstName: 'John', LastName: 'Doe', Email: 'john@acme.com', Phone: '555-0101', AccountId: '001xx000003DGP0', CreatedDate: '2024-03-01T08:00:00Z', SystemModstamp: '2024-06-15T10:00:00Z' },
    { attributes: { type: 'Contact', url: '/services/data/v60.0/sobjects/Contact/003xx000004DGP1' }, Id: '003xx000004DGP1', FirstName: 'Jane', LastName: 'Smith', Email: 'jane@globex.com', Phone: null, AccountId: '001xx000003DGP1', CreatedDate: '2024-04-10T11:00:00Z', SystemModstamp: '2024-07-20T15:00:00Z' },
  ],
};

export const MOCK_SALESFORCE_OPPORTUNITIES = {
  totalSize: 1,
  done: true,
  records: [
    { attributes: { type: 'Opportunity', url: '/services/data/v60.0/sobjects/Opportunity/006xx000005DGP0' }, Id: '006xx000005DGP0', Name: 'Big Deal', Amount: 50000, StageName: 'Closed Won', CloseDate: '2024-06-30', AccountId: '001xx000003DGP0', CreatedDate: '2024-01-20T09:00:00Z', SystemModstamp: '2024-07-01T12:00:00Z' },
  ],
};

export const MOCK_SALESFORCE_LIMITS = {
  DailyApiRequests: { Max: 100000, Remaining: 99500 },
  DataStorageMB: { Max: 1024, Remaining: 800 },
};

export const MOCK_SALESFORCE_ACCOUNT_DESCRIBE = {
  fields: [
    { name: 'Id', type: 'id', nillable: false },
    { name: 'Name', type: 'string', nillable: false },
    { name: 'Industry', type: 'picklist', nillable: true },
    { name: 'Phone', type: 'phone', nillable: true },
    { name: 'Website', type: 'url', nillable: true },
    { name: 'CreatedDate', type: 'datetime', nillable: false },
    { name: 'SystemModstamp', type: 'datetime', nillable: false },
  ],
};

export const MOCK_HUBSPOT_CONTACTS = {
  results: [
    { id: '101', properties: { email: 'john@acme.com', firstname: 'John', lastname: 'Doe', phone: '555-0101' }, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-06-01T12:00:00Z', archived: false },
    { id: '102', properties: { email: 'jane@globex.com', firstname: 'Jane', lastname: 'Smith', phone: null }, createdAt: '2024-02-20T14:00:00Z', updatedAt: '2024-07-10T09:00:00Z', archived: false },
  ],
  total: 2,
  paging: { next: { after: '102' } },
};

export const MOCK_HUBSPOT_COMPANIES = {
  results: [
    { id: '201', properties: { name: 'Acme Corp', domain: 'acme.com', industry: 'Technology', phone: '555-0100' }, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-05-20T11:00:00Z', archived: false },
    { id: '202', properties: { name: 'Globex Inc', domain: 'globex.com', industry: 'Finance', phone: '555-0200' }, createdAt: '2024-03-05T09:00:00Z', updatedAt: '2024-07-15T14:00:00Z', archived: false },
  ],
  total: 2,
  paging: { next: { after: '202' } },
};

export const MOCK_HUBSPOT_DEALS = {
  results: [
    { id: '301', properties: { amount: '50000', dealname: 'Big Deal', stage: 'closedwon', pipeline: 'default' }, createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-06-30T16:00:00Z', archived: false },
    { id: '302', properties: { amount: '10000', dealname: 'Small Deal', stage: 'qualifiedtobuy', pipeline: 'default' }, createdAt: '2024-04-15T13:00:00Z', updatedAt: '2024-08-01T10:00:00Z', archived: false },
  ],
  total: 2,
  paging: { next: { after: '302' } },
};

export const MOCK_HUBSPOT_PROPERTIES = {
  results: [
    { name: 'hs_object_id', label: 'Record ID', type: 'number', fieldType: 'number', groupName: 'contactinformation', required: true },
    { name: 'email', label: 'Email', type: 'string', fieldType: 'text', groupName: 'contactinformation', required: false },
    { name: 'firstname', label: 'First Name', type: 'string', fieldType: 'text', groupName: 'contactinformation', required: false },
    { name: 'lastname', label: 'Last Name', type: 'string', fieldType: 'text', groupName: 'contactinformation', required: true },
    { name: 'phone', label: 'Phone', type: 'string', fieldType: 'text', groupName: 'contactinformation', required: false },
  ],
};
