// Salesforce Connector — Certification Test Suite
// Mocked HTTP for CI/CD; real API when TEST_SALESFORCE_TOKEN is set.
// Engine: salesforce-real

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  installFetchMock, uninstallFetchMock,
  clearMockRoutes, mockRoute, mockResponse,
  assertConnect, assertConnectRejectsNoCreds,
  assertDisconnect,
  MOCK_SALESFORCE_LIMITS, MOCK_SALESFORCE_SOBJECTS,
  MOCK_SALESFORCE_ACCOUNTS, MOCK_SALESFORCE_CONTACTS, MOCK_SALESFORCE_OPPORTUNITIES,
  MOCK_SALESFORCE_ACCOUNT_DESCRIBE,
} from './saas-test-helpers';
import { SalesforceRealConnector } from '../../connectors/salesforce-real';

const ENV_KEY = 'TEST_SALESFORCE_TOKEN';
const hasRealKey = !!process.env[ENV_KEY];

function mockConfig(): any {
  return {
    host: 'https://test.my.salesforce.com', port: 0, database: '', user: '',
    password: 'mock_sf_token_12345',
  };
}

function realConfig(): any {
  return {
    host: process.env.TEST_SALESFORCE_HOST || 'https://login.salesforce.com',
    port: 0, database: '', user: '',
    password: process.env[ENV_KEY],
  };
}

// ─── Unit Tests (mocked fetch — always run) ─────────────────────────────────

describe('SalesforceRealConnector (unit — mocked)', () => {
  let connector: SalesforceRealConnector;

  beforeEach(() => {
    installFetchMock();
    clearMockRoutes();

    // Limits (connectivity check)
    mockRoute('GET', '/limits', () => mockResponse(MOCK_SALESFORCE_LIMITS));

    // SObjects list
    mockRoute('GET', '/sobjects', () => mockResponse(MOCK_SALESFORCE_SOBJECTS));

    // Account describe
    mockRoute('GET', '/sobjects/Account/describe', () => mockResponse(MOCK_SALESFORCE_ACCOUNT_DESCRIBE));

    // Contact describe
    mockRoute('GET', '/sobjects/Contact/describe', () => mockResponse({
      fields: [
        { name: 'Id', type: 'id', nillable: false },
        { name: 'FirstName', type: 'string', nillable: true },
        { name: 'LastName', type: 'string', nillable: false },
        { name: 'Email', type: 'email', nillable: true },
        { name: 'Phone', type: 'phone', nillable: true },
        { name: 'AccountId', type: 'reference', nillable: true },
        { name: 'CreatedDate', type: 'datetime', nillable: false },
        { name: 'SystemModstamp', type: 'datetime', nillable: false },
      ],
    }));

    // Opportunity describe
    mockRoute('GET', '/sobjects/Opportunity/describe', () => mockResponse({
      fields: [
        { name: 'Id', type: 'id', nillable: false },
        { name: 'Name', type: 'string', nillable: false },
        { name: 'Amount', type: 'currency', nillable: true },
        { name: 'StageName', type: 'picklist', nillable: false },
        { name: 'CloseDate', type: 'date', nillable: false },
        { name: 'AccountId', type: 'reference', nillable: true },
        { name: 'CreatedDate', type: 'datetime', nillable: false },
        { name: 'SystemModstamp', type: 'datetime', nillable: false },
      ],
    }));

    // SOQL query endpoints
    mockRoute('GET', /\/query\?q=.*/, (url) => {
      const q = decodeURIComponent(url.split('q=')[1] || '');
      if (q.includes('FROM Account')) return mockResponse(MOCK_SALESFORCE_ACCOUNTS);
      if (q.includes('FROM Contact')) return mockResponse(MOCK_SALESFORCE_CONTACTS);
      if (q.includes('FROM Opportunity')) return mockResponse(MOCK_SALESFORCE_OPPORTUNITIES);
      return mockResponse({ totalSize: 0, done: true, records: [] });
    });

    connector = new SalesforceRealConnector('test-sf', 'Salesforce Test', 'salesforce-real', mockConfig());
  });

  afterEach(() => {
    uninstallFetchMock();
  });

  // ── connect (OAuth2) ──

  describe('connect', () => {
    it('connects successfully with valid access token', async () => {
      await assertConnect(connector, mockConfig());
    });

    it('rejects missing access token', async () => {
      await assertConnectRejectsNoCreds(SalesforceRealConnector, 'salesforce-real');
    });

    it('rejects on HTTP error from /limits', async () => {
      clearMockRoutes();
      mockRoute('GET', '/limits', () => mockResponse({ error: 'invalid_grant' }, 401, 'Unauthorized'));

      await expect(connector.connect(mockConfig())).rejects.toThrow('Salesforce connection failed');
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
      mockRoute('GET', '/limits', () => mockResponse({ error: 'fail' }, 401));
      await connector.connect(mockConfig());
      clearMockRoutes();
      mockRoute('GET', '/limits', () => mockResponse({ error: 'fail' }, 401));

      expect(await connector.testConnection()).toBe(false);
    });
  });

  // ── getTables ──

  describe('getTables', () => {
    it('returns queryable SObjects', async () => {
      await connector.connect(mockConfig());
      const tables = await connector.getTables();

      expect(tables).toContain('Account');
      expect(tables).toContain('Contact');
      expect(tables).toContain('Opportunity');
      // Case is retrieveable but not queryable — should be excluded
      expect(tables).not.toContain('Case');
    });
  });

  // ── getTableSchema ──

  describe('getTableSchema', () => {
    beforeEach(async () => {
      await connector.connect(mockConfig());
    });

    it('returns valid schema for Account', async () => {
      const schema = await connector.getTableSchema('Account');
      expect(schema.table).toBe('Account');
      expect(schema.primaryKeys).toContain('Id');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('Id');
      expect(colNames).toContain('Name');
      expect(colNames).toContain('Industry');
      expect(colNames).toContain('Phone');
    });

    it('returns valid schema for Contact', async () => {
      const schema = await connector.getTableSchema('Contact');
      expect(schema.table).toBe('Contact');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('Id');
      expect(colNames).toContain('FirstName');
      expect(colNames).toContain('LastName');
      expect(colNames).toContain('Email');
    });

    it('returns valid schema for Opportunity', async () => {
      const schema = await connector.getTableSchema('Opportunity');
      expect(schema.table).toBe('Opportunity');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('Id');
      expect(colNames).toContain('Name');
      expect(colNames).toContain('Amount');
      expect(colNames).toContain('StageName');
    });

    it('maps Salesforce types correctly', async () => {
      const schema = await connector.getTableSchema('Account');
      const nameCol = schema.columns.find(c => c.name === 'Name');
      expect(nameCol?.type).toBe('string');
      const industryCol = schema.columns.find(c => c.name === 'Industry');
      expect(industryCol?.type).toBe('string'); // picklist -> string
      const createdCol = schema.columns.find(c => c.name === 'CreatedDate');
      expect(createdCol?.type).toBe('string'); // datetime -> string
    });

    it('returns fallback schema for unknown object', async () => {
      clearMockRoutes();
      mockRoute('GET', '/limits', () => mockResponse(MOCK_SALESFORCE_LIMITS));
      mockRoute('GET', '/sobjects/UnknownObj/describe', () => mockResponse({ error: 'not found' }, 404));

      await connector.connect(mockConfig());
      const schema = await connector.getTableSchema('UnknownObj');
      expect(schema.table).toBe('UnknownObj');
      expect(schema.columns).toEqual([]);
    });
  });

  // ── extractFull ──

  describe('extractFull', () => {
    beforeEach(async () => {
      await connector.connect(mockConfig());
    });

    it('extracts Account records', async () => {
      const events = await connector.extractFull('Account');
      expect(events.length).toBe(2);
      expect(events[0].op).toBe('S');
      expect(events[0].table).toBe('Account');
      expect(events[0].after.Name).toBe('Acme Corp');
      // attributes should be stripped
      expect(events[0].after.attributes).toBeUndefined();
    });

    it('extracts Contact records', async () => {
      const events = await connector.extractFull('Contact');
      expect(events.length).toBe(2);
      expect(events[0].after.FirstName).toBe('John');
      expect(events[0].after.Email).toBe('john@acme.com');
    });

    it('extracts Opportunity records', async () => {
      const events = await connector.extractFull('Opportunity');
      expect(events.length).toBe(1);
      expect(events[0].after.Name).toBe('Big Deal');
      expect(events[0].after.Amount).toBe(50000);
    });

    it('returns empty array on API error', async () => {
      clearMockRoutes();
      mockRoute('GET', '/limits', () => mockResponse(MOCK_SALESFORCE_LIMITS));
      mockRoute('GET', /\/query\?q=.*/, () => mockResponse({ error: 'invalid query' }, 400));

      await connector.connect(mockConfig());
      const events = await connector.extractFull('Account');
      expect(events).toEqual([]);
    });

    it('sets watermark from SystemModstamp', async () => {
      const events = await connector.extractFull('Account');
      expect(events[0].watermark).toBeDefined();
      expect(events[0].watermark).toContain('2024');
    });
  });

  // ── disconnect ──

  describe('disconnect', () => {
    it('disconnects cleanly', async () => {
      await connector.connect(mockConfig());
      await assertDisconnect(connector);
    });
  });

  // ── Salesforce-specific methods ──

  describe('query (SOQL)', () => {
    it('executes SOQL query and returns records', async () => {
      await connector.connect(mockConfig());
      const records = await connector.query('SELECT Id, Name FROM Account');
      expect(records.length).toBe(2);
      expect(records[0].Name).toBe('Acme Corp');
      // attributes stripped
      expect(records[0].attributes).toBeUndefined();
    });
  });
});

// ─── Live Integration Tests (require TEST_SALESFORCE_TOKEN) ─────────────────

describe.skipIf(!hasRealKey)('SalesforceRealConnector (live API)', () => {
  let connector: SalesforceRealConnector;

  beforeEach(async () => {
    connector = new SalesforceRealConnector('test-sf-live', 'Salesforce Live', 'salesforce-real', realConfig());
    await connector.connect(realConfig());
  });

  afterEach(async () => {
    try { await connector.disconnect(); } catch {}
  });

  it('connects to real Salesforce API', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('testConnection returns true', async () => {
    expect(await connector.testConnection()).toBe(true);
  });

  it('getTables returns real SObjects', async () => {
    const tables = await connector.getTables();
    expect(tables.length).toBeGreaterThan(0);
    expect(tables).toContain('Account');
  });

  it('getTableSchema returns real Account fields', async () => {
    const schema = await connector.getTableSchema('Account');
    expect(schema.columns.length).toBeGreaterThan(5);
    expect(schema.primaryKeys).toContain('Id');
  });

  it('extractFull Account returns real records', async () => {
    const events = await connector.extractFull('Account', { limit: 3 });
    expect(Array.isArray(events)).toBe(true);
    for (const evt of events) {
      expect(evt.op).toBe('S');
      expect(evt.after.Id).toBeDefined();
    }
  });

  it('extractFull Contact returns real records', async () => {
    const events = await connector.extractFull('Contact', { limit: 3 });
    expect(Array.isArray(events)).toBe(true);
  });

  it('extractFull Opportunity returns real records', async () => {
    const events = await connector.extractFull('Opportunity', { limit: 3 });
    expect(Array.isArray(events)).toBe(true);
  });
});
