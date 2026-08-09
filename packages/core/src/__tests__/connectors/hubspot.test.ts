// HubSpot Connector — Certification Test Suite
// Mocked HTTP for CI/CD; real API when TEST_HUBSPOT_TOKEN is set.
// Engine: hubspot-real

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  installFetchMock, uninstallFetchMock,
  clearMockRoutes, mockRoute, mockResponse,
  assertConnect, assertConnectRejectsNoCreds,
  assertDisconnect,
  MOCK_HUBSPOT_CONTACTS, MOCK_HUBSPOT_COMPANIES, MOCK_HUBSPOT_DEALS,
  MOCK_HUBSPOT_PROPERTIES,
} from './saas-test-helpers';
import { HubSpotRealConnector } from '../../connectors/hubspot-real';

const ENV_KEY = 'TEST_HUBSPOT_TOKEN';
const hasRealKey = !!process.env[ENV_KEY];

function mockConfig(): any {
  return {
    host: '', port: 0, database: '', user: '',
    password: 'pat-na1-mock-token-12345',
  };
}

function realConfig(): any {
  return {
    host: '', port: 0, database: '', user: '',
    password: process.env[ENV_KEY],
  };
}

// ─── Unit Tests (mocked fetch — always run) ─────────────────────────────────

describe('HubSpotRealConnector (unit — mocked)', () => {
  let connector: HubSpotRealConnector;

  beforeEach(() => {
    installFetchMock();
    clearMockRoutes();

    // Contacts endpoint (connectivity check + extract)
    mockRoute('GET', '/crm/v3/objects/contacts', () => mockResponse(MOCK_HUBSPOT_CONTACTS));

    // Companies endpoint
    mockRoute('GET', '/crm/v3/objects/companies', () => mockResponse(MOCK_HUBSPOT_COMPANIES));

    // Deals endpoint
    mockRoute('GET', '/crm/v3/objects/deals', () => mockResponse(MOCK_HUBSPOT_DEALS));

    // Properties endpoints (schema discovery)
    mockRoute('GET', '/crm/v3/properties/contacts', () => mockResponse(MOCK_HUBSPOT_PROPERTIES));
    mockRoute('GET', '/crm/v3/properties/companies', () => mockResponse({
      results: [
        { name: 'hs_object_id', label: 'Record ID', type: 'number', fieldType: 'number', groupName: 'companyinformation', required: true },
        { name: 'name', label: 'Company Name', type: 'string', fieldType: 'text', groupName: 'companyinformation', required: false },
        { name: 'domain', label: 'Website Domain', type: 'string', fieldType: 'text', groupName: 'companyinformation', required: false },
        { name: 'industry', label: 'Industry', type: 'string', fieldType: 'text', groupName: 'companyinformation', required: false },
        { name: 'phone', label: 'Phone Number', type: 'string', fieldType: 'text', groupName: 'companyinformation', required: false },
      ],
    }));
    mockRoute('GET', '/crm/v3/properties/deals', () => mockResponse({
      results: [
        { name: 'hs_object_id', label: 'Record ID', type: 'number', fieldType: 'number', groupName: 'dealinformation', required: true },
        { name: 'dealname', label: 'Deal Name', type: 'string', fieldType: 'text', groupName: 'dealinformation', required: false },
        { name: 'amount', label: 'Amount', type: 'number', fieldType: 'number', groupName: 'dealinformation', required: false },
        { name: 'stage', label: 'Deal Stage', type: 'enumeration', fieldType: 'select', groupName: 'dealinformation', required: false },
        { name: 'pipeline', label: 'Pipeline', type: 'string', fieldType: 'text', groupName: 'dealinformation', required: false },
      ],
    }));

    connector = new HubSpotRealConnector('test-hs', 'HubSpot Test', 'hubspot-real', mockConfig());
  });

  afterEach(() => {
    uninstallFetchMock();
  });

  // ── connect ──

  describe('connect', () => {
    it('connects successfully with valid Private App token', async () => {
      await assertConnect(connector, mockConfig());
    });

    it('rejects missing token', async () => {
      await assertConnectRejectsNoCreds(HubSpotRealConnector, 'hubspot-real');
    });

    it('rejects on HTTP error from contacts endpoint', async () => {
      clearMockRoutes();
      mockRoute('GET', '/crm/v3/objects/contacts', () => mockResponse({ error: 'Unauthorized' }, 401, 'Unauthorized'));

      await expect(connector.connect(mockConfig())).rejects.toThrow('HubSpot connection failed');
    });
  });

  // ── testConnection ──

  describe('testConnection', () => {
    it('returns true when connected', async () => {
      await connector.connect(mockConfig());
      expect(await connector.testConnection()).toBe(true);
    });

    it('returns false on API error', async () => {
      clearMockRoutes();
      mockRoute('GET', '/crm/v3/objects/contacts', () => mockResponse({ error: 'fail' }, 500));
      await connector.connect(mockConfig());
      clearMockRoutes();
      mockRoute('GET', '/crm/v3/objects/contacts', () => mockResponse({ error: 'fail' }, 500));

      expect(await connector.testConnection()).toBe(false);
    });
  });

  // ── getTables ──

  describe('getTables', () => {
    it('returns expected HubSpot CRM object types', async () => {
      await connector.connect(mockConfig());
      const tables = await connector.getTables();

      expect(tables).toContain('contacts');
      expect(tables).toContain('companies');
      expect(tables).toContain('deals');
      expect(tables).toContain('tickets');
      expect(tables).toContain('products');
      expect(tables).toContain('quotes');
      expect(tables.length).toBeGreaterThanOrEqual(7);
    });
  });

  // ── getTableSchema ──

  describe('getTableSchema', () => {
    beforeEach(async () => {
      await connector.connect(mockConfig());
    });

    it('returns valid schema for contacts', async () => {
      const schema = await connector.getTableSchema('contacts');
      expect(schema.table).toBe('contacts');
      expect(schema.primaryKeys).toContain('hs_object_id');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('hs_object_id');
      expect(colNames).toContain('email');
      expect(colNames).toContain('firstname');
      expect(colNames).toContain('lastname');
    });

    it('returns valid schema for companies', async () => {
      const schema = await connector.getTableSchema('companies');
      expect(schema.table).toBe('companies');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('hs_object_id');
      expect(colNames).toContain('name');
      expect(colNames).toContain('domain');
      expect(colNames).toContain('industry');
    });

    it('returns valid schema for deals', async () => {
      const schema = await connector.getTableSchema('deals');
      expect(schema.table).toBe('deals');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('hs_object_id');
      expect(colNames).toContain('dealname');
      expect(colNames).toContain('amount');
      expect(colNames).toContain('stage');
    });

    it('maps HubSpot types correctly', async () => {
      const schema = await connector.getTableSchema('contacts');
      const emailCol = schema.columns.find(c => c.name === 'email');
      expect(emailCol?.type).toBe('string');
      const hsIdCol = schema.columns.find(c => c.name === 'hs_object_id');
      expect(hsIdCol?.type).toBe('number');
    });

    it('returns fallback schema when properties endpoint fails', async () => {
      clearMockRoutes();
      mockRoute('GET', '/crm/v3/objects/contacts', () => mockResponse(MOCK_HUBSPOT_CONTACTS));
      mockRoute('GET', '/crm/v3/properties/unknown', () => mockResponse({ error: 'not found' }, 404));

      await connector.connect(mockConfig());
      const schema = await connector.getTableSchema('unknown');
      expect(schema.table).toBe('unknown');
      expect(schema.columns.length).toBe(1);
      expect(schema.columns[0].name).toBe('id');
    });
  });

  // ── extractFull ──

  describe('extractFull', () => {
    beforeEach(async () => {
      await connector.connect(mockConfig());
    });

    it('extracts contacts with snapshot events', async () => {
      const events = await connector.extractFull('contacts');
      expect(events.length).toBe(2);
      expect(events[0].op).toBe('S');
      expect(events[0].table).toBe('contacts');
      expect(events[0].after.email).toBe('john@acme.com');
      expect(events[0].after.firstname).toBe('John');
    });

    it('extracts companies with snapshot events', async () => {
      const events = await connector.extractFull('companies');
      expect(events.length).toBe(2);
      expect(events[0].after.name).toBe('Acme Corp');
      expect(events[0].after.domain).toBe('acme.com');
    });

    it('extracts deals with snapshot events', async () => {
      const events = await connector.extractFull('deals');
      expect(events.length).toBe(2);
      expect(events[0].after.dealname).toBe('Big Deal');
      expect(events[0].after.amount).toBe('50000');
    });

    it('flattens properties into top-level fields', async () => {
      const events = await connector.extractFull('contacts');
      // HubSpot returns { id, properties: { ... } }, connector flattens to { id, ...props }
      expect(events[0].after.id).toBe('101');
      expect(events[0].after.email).toBeDefined();
      expect(events[0].after.properties).toBeUndefined();
    });

    it('returns empty array on API error', async () => {
      clearMockRoutes();
      mockRoute('GET', '/crm/v3/objects/contacts', () => mockResponse({ error: 'rate limited' }, 429));

      await connector.connect(mockConfig());
      const events = await connector.extractFull('contacts');
      expect(events).toEqual([]);
    });
  });

  // ── disconnect ──

  describe('disconnect', () => {
    it('disconnects cleanly', async () => {
      await connector.connect(mockConfig());
      await assertDisconnect(connector);
    });
  });
});

// ─── Live Integration Tests (require TEST_HUBSPOT_TOKEN) ────────────────────

describe.skipIf(!hasRealKey)('HubSpotRealConnector (live API)', () => {
  let connector: HubSpotRealConnector;

  beforeEach(async () => {
    connector = new HubSpotRealConnector('test-hs-live', 'HubSpot Live', 'hubspot-real', realConfig());
    await connector.connect(realConfig());
  });

  afterEach(async () => {
    try { await connector.disconnect(); } catch {}
  });

  it('connects to real HubSpot API', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('testConnection returns true', async () => {
    expect(await connector.testConnection()).toBe(true);
  });

  it('getTables returns CRM object list', async () => {
    const tables = await connector.getTables();
    expect(tables).toContain('contacts');
    expect(tables).toContain('companies');
    expect(tables).toContain('deals');
  });

  it('getTableSchema returns real contact properties', async () => {
    const schema = await connector.getTableSchema('contacts');
    expect(schema.columns.length).toBeGreaterThan(0);
    expect(schema.primaryKeys).toContain('hs_object_id');
  });

  it('extractFull contacts returns real data', async () => {
    const events = await connector.extractFull('contacts');
    expect(Array.isArray(events)).toBe(true);
    for (const evt of events) {
      expect(evt.op).toBe('S');
      expect(evt.after.id).toBeDefined();
    }
  });

  it('extractFull companies returns real data', async () => {
    const events = await connector.extractFull('companies');
    expect(Array.isArray(events)).toBe(true);
  });

  it('extractFull deals returns real data', async () => {
    const events = await connector.extractFull('deals');
    expect(Array.isArray(events)).toBe(true);
  });
});
