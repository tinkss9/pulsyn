// Stripe Connector — Certification Test Suite
// Mocked HTTP for CI/CD; real API when TEST_STRIPE_API_KEY is set.
// Engine: stripe-real

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  installFetchMock, uninstallFetchMock,
  clearMockRoutes, mockRoute, mockResponse,
  assertConnect, assertConnectRejectsNoCreds,
  assertGetTables, assertGetTableSchema, assertExtractFull, assertDisconnect,
  MOCK_STRIPE_BALANCE, MOCK_STRIPE_CUSTOMERS, MOCK_STRIPE_CHARGES, MOCK_STRIPE_INVOICES,
} from './saas-test-helpers';
import { StripeRealConnector } from '../../connectors/stripe-real';

const ENV_KEY = 'TEST_STRIPE_API_KEY';
const hasRealKey = !!process.env[ENV_KEY];

function mockConfig(): any {
  return {
    host: '', port: 0, database: '', user: '',
    password: 'sk_test_mock_key_12345',
  };
}

function realConfig(): any {
  return {
    host: '', port: 0, database: '', user: '',
    password: process.env[ENV_KEY],
  };
}

// ─── Unit Tests (mocked fetch — always run) ─────────────────────────────────

describe('StripeRealConnector (unit — mocked)', () => {
  let connector: StripeRealConnector;

  beforeEach(() => {
    installFetchMock();
    clearMockRoutes();

    // Balance endpoint (connectivity check)
    mockRoute('GET', '/balance', () => mockResponse(MOCK_STRIPE_BALANCE));

    // Customers
    mockRoute('GET', '/customers', (url) => {
      if (url.includes('limit=')) return mockResponse(MOCK_STRIPE_CUSTOMERS);
      return mockResponse(MOCK_STRIPE_CUSTOMERS);
    });

    // Charges
    mockRoute('GET', '/charges', () => mockResponse(MOCK_STRIPE_CHARGES));

    // Invoices
    mockRoute('GET', '/invoices', () => mockResponse(MOCK_STRIPE_INVOICES));

    connector = new StripeRealConnector('test-stripe', 'Stripe Test', 'stripe-real', mockConfig());
  });

  afterEach(() => {
    uninstallFetchMock();
  });

  // ── connect ──

  describe('connect', () => {
    it('connects successfully with valid API key', async () => {
      await assertConnect(connector, mockConfig());
    });

    it('rejects missing API key', async () => {
      await assertConnectRejectsNoCreds(StripeRealConnector, 'stripe-real');
    });

    it('rejects on HTTP error from /balance', async () => {
      clearMockRoutes();
      mockRoute('GET', '/balance', () => mockResponse({ error: 'Unauthorized' }, 401, 'Unauthorized'));

      await expect(connector.connect(mockConfig())).rejects.toThrow('Stripe connection failed');
    });
  });

  // ── testConnection ──

  describe('testConnection', () => {
    it('returns true when connected', async () => {
      await connector.connect(mockConfig());
      const result = await connector.testConnection();
      expect(result).toBe(true);
    });

    it('returns false on API error', async () => {
      clearMockRoutes();
      mockRoute('GET', '/balance', () => mockResponse({ error: 'fail' }, 500));

      await connector.connect(mockConfig());
      // Re-setup mock to fail on testConnection
      clearMockRoutes();
      mockRoute('GET', '/balance', () => mockResponse({ error: 'fail' }, 500));

      const result = await connector.testConnection();
      expect(result).toBe(false);
    });
  });

  // ── getTables ──

  describe('getTables', () => {
    it('returns expected Stripe resource tables', async () => {
      await connector.connect(mockConfig());
      const tables = await connector.getTables();

      expect(tables).toContain('customers');
      expect(tables).toContain('charges');
      expect(tables).toContain('invoices');
      expect(tables).toContain('subscriptions');
      expect(tables).toContain('payment_intents');
      expect(tables).toContain('products');
      expect(tables).toContain('payouts');
      expect(tables).toContain('refunds');
      expect(tables).toContain('disputes');
      expect(tables.length).toBeGreaterThanOrEqual(10);
    });
  });

  // ── getTableSchema ──

  describe('getTableSchema', () => {
    beforeEach(async () => {
      await connector.connect(mockConfig());
    });

    it('returns valid schema for customers', async () => {
      const schema = await connector.getTableSchema('customers');
      expect(schema.table).toBe('customers');
      expect(schema.primaryKeys).toContain('id');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('id');
      expect(colNames).toContain('email');
      expect(colNames).toContain('name');
      expect(colNames).toContain('created');
    });

    it('returns valid schema for charges', async () => {
      const schema = await connector.getTableSchema('charges');
      expect(schema.table).toBe('charges');
      expect(schema.primaryKeys).toContain('id');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('id');
      expect(colNames).toContain('amount');
      expect(colNames).toContain('currency');
      expect(colNames).toContain('status');
      expect(colNames).toContain('paid');
    });

    it('returns valid schema for invoices', async () => {
      const schema = await connector.getTableSchema('invoices');
      expect(schema.table).toBe('invoices');
      const colNames = schema.columns.map(c => c.name);
      expect(colNames).toContain('id');
      expect(colNames).toContain('customer');
      expect(colNames).toContain('amount_due');
      expect(colNames).toContain('amount_paid');
      expect(colNames).toContain('status');
    });

    it('returns fallback schema for unknown table', async () => {
      const schema = await connector.getTableSchema('nonexistent');
      expect(schema.table).toBe('nonexistent');
      expect(schema.columns.length).toBe(1);
      expect(schema.columns[0].name).toBe('id');
    });
  });

  // ── extractFull ──

  describe('extractFull', () => {
    beforeEach(async () => {
      await connector.connect(mockConfig());
    });

    it('extracts customers with snapshot events', async () => {
      const events = await assertExtractFull(connector, 'customers', 1);
      expect(events.length).toBe(2);
      expect(events[0].after.id).toBe('cus_test1');
      expect(events[0].after.email).toBe('test@example.com');
    });

    it('extracts charges with snapshot events', async () => {
      const events = await assertExtractFull(connector, 'charges', 1);
      expect(events.length).toBe(2);
      expect(events[0].after.amount).toBe(2000);
      expect(events[0].after.currency).toBe('usd');
    });

    it('extracts invoices with snapshot events', async () => {
      const events = await assertExtractFull(connector, 'invoices', 1);
      expect(events.length).toBe(2);
      expect(events[0].after.status).toBe('paid');
    });

    it('returns empty array on API error', async () => {
      clearMockRoutes();
      mockRoute('GET', '/balance', () => mockResponse(MOCK_STRIPE_BALANCE));
      mockRoute('GET', '/customers', () => mockResponse({ error: 'rate limited' }, 429));

      await connector.connect(mockConfig());
      const events = await connector.extractFull('customers');
      expect(events).toEqual([]);
    });

    it('respects limit parameter', async () => {
      let capturedUrl = '';
      clearMockRoutes();
      mockRoute('GET', '/balance', () => mockResponse(MOCK_STRIPE_BALANCE));
      mockRoute('GET', '/customers', (url) => {
        capturedUrl = url;
        return mockResponse(MOCK_STRIPE_CUSTOMERS);
      });

      await connector.connect(mockConfig());
      await connector.extractFull('customers', { limit: 5 });
      expect(capturedUrl).toContain('limit=5');
    });
  });

  // ── disconnect ──

  describe('disconnect', () => {
    it('disconnects cleanly', async () => {
      await connector.connect(mockConfig());
      await assertDisconnect(connector);
    });
  });

  // ── Stripe-specific methods ──

  describe('getBalance', () => {
    it('returns balance object', async () => {
      await connector.connect(mockConfig());
      const balance = await (connector as any).getBalance();
      expect(balance).toBeDefined();
      expect(balance.available).toBeDefined();
    });
  });

  describe('getCustomer', () => {
    it('returns a specific customer', async () => {
      mockRoute('GET', '/customers/cus_test1', () => mockResponse(MOCK_STRIPE_CUSTOMERS.data[0]));
      await connector.connect(mockConfig());
      const customer = await (connector as any).getCustomer('cus_test1');
      expect(customer).toBeDefined();
      expect(customer.id).toBe('cus_test1');
    });
  });

  describe('getCharge', () => {
    it('returns a specific charge', async () => {
      mockRoute('GET', '/charges/ch_test1', () => mockResponse(MOCK_STRIPE_CHARGES.data[0]));
      await connector.connect(mockConfig());
      const charge = await (connector as any).getCharge('ch_test1');
      expect(charge).toBeDefined();
      expect(charge.id).toBe('ch_test1');
    });
  });
});

// ─── Live Integration Tests (require TEST_STRIPE_API_KEY) ───────────────────

describe.skipIf(!hasRealKey)('StripeRealConnector (live API)', () => {
  let connector: StripeRealConnector;

  beforeEach(async () => {
    connector = new StripeRealConnector('test-stripe-live', 'Stripe Live', 'stripe-real', realConfig());
    await connector.connect(realConfig());
  });

  afterEach(async () => {
    try { await connector.disconnect(); } catch {}
  });

  it('connects to real Stripe API', () => {
    expect(connector.isConnected()).toBe(true);
  });

  it('testConnection returns true', async () => {
    const result = await connector.testConnection();
    expect(result).toBe(true);
  });

  it('getTables returns Stripe resource list', async () => {
    const tables = await connector.getTables();
    expect(tables).toContain('customers');
    expect(tables).toContain('charges');
    expect(tables).toContain('invoices');
  });

  it('getTableSchema returns real customer schema', async () => {
    const schema = await connector.getTableSchema('customers');
    expect(schema.columns.length).toBeGreaterThan(0);
    expect(schema.primaryKeys).toContain('id');
  });

  it('extractFull customers returns real data', async () => {
    const events = await connector.extractFull('customers', { limit: 3 });
    expect(Array.isArray(events)).toBe(true);
    for (const evt of events) {
      expect(evt.op).toBe('S');
      expect(evt.after.id).toBeDefined();
    }
  });

  it('extractFull charges returns real data', async () => {
    const events = await connector.extractFull('charges', { limit: 3 });
    expect(Array.isArray(events)).toBe(true);
  });

  it('extractFull invoices returns real data', async () => {
    const events = await connector.extractFull('invoices', { limit: 3 });
    expect(Array.isArray(events)).toBe(true);
  });
});
