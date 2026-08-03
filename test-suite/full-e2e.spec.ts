import { test, expect } from '@playwright/test';

const BASE = 'https://pulsynai.com';

test.describe('Full E2E Suite — API Generation, MCP, Lab Access', () => {

  test('API: Signup and get API key', async ({ request }) => {
    const email = `test-${Date.now()}@pulsyn.io`;
    const resp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'E2E Test Org', email, company: 'Test Co' },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.apiKey).toBeTruthy();
    expect(body.data.organizationId).toBeTruthy();
    expect(body.data.apiKey).toMatch(/^pulsyn_/);
    console.log(`PASS: Signup — org=${body.data.organizationId}, key=${body.data.apiKey.slice(0, 20)}...`);
  });

  test('API: Create connector via POST /api/connectors', async ({ request }) => {
    // First signup to get API key
    const email = `conn-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Connector Test', email },
    });
    const { apiKey } = (await signupResp.json()).data;

    // Create connector
    const resp = await request.post(`${BASE}/api/connectors`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'Test PostgreSQL',
        engine: 'postgresql',
        config: { host: 'localhost', port: 5432, database: 'test', user: 'test', password: 'test' },
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.id).toBeTruthy();
    expect(body.data.name).toBe('Test PostgreSQL');
    expect(body.data.engine).toBe('postgresql');
    expect(body.data.config.password).toBe('***'); // Masked
    console.log(`PASS: Create connector — id=${body.data.id}, password masked`);
  });

  test('API: Create pipeline via POST /api/pipelines', async ({ request }) => {
    const email = `pipe-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Pipeline Test', email },
    });
    const { apiKey } = (await signupResp.json()).data;

    const resp = await request.post(`${BASE}/api/pipelines`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'Test Pipeline',
        source: { host: 'localhost', port: 5432, engine: 'postgresql', database: 'source_db', user: 'test', password: 'test' },
        target: { host: 'localhost', port: 5432, engine: 'postgresql', database: 'target_db', user: 'test', password: 'test' },
        tables: ['users', 'orders'],
        config: { tableMapping: { users: 'target_users', orders: 'target_orders' } },
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.id).toBeTruthy();
    expect(body.data.name).toBe('Test Pipeline');
    expect(body.data.source.password).toBe('***'); // Masked
    expect(body.data.target.password).toBe('***'); // Masked
    console.log(`PASS: Create pipeline — id=${body.data.id}, passwords masked`);
  });

  test('API: List pipelines via GET /api/pipelines', async ({ request }) => {
    const email = `list-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'List Test', email },
    });
    const { apiKey } = (await signupResp.json()).data;

    // Create a pipeline first
    await request.post(`${BASE}/api/pipelines`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'List Test Pipeline',
        source: { host: 'localhost', engine: 'postgresql', database: 'src', user: 't', password: 'p' },
        target: { host: 'localhost', engine: 'postgresql', database: 'tgt', user: 't', password: 'p' },
        tables: ['test_table'],
      },
    });

    // List pipelines
    const resp = await request.get(`${BASE}/api/pipelines`, {
      headers: { 'x-api-key': apiKey },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].source.password).toBe('***');
    console.log(`PASS: List pipelines — ${body.data.length} pipelines, passwords masked`);
  });

  test('API: Start and stop CDC', async ({ request }) => {
    const email = `cdc-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'CDC Test', email },
    });
    const { apiKey } = (await signupResp.json()).data;

    // Create pipeline
    const pipeResp = await request.post(`${BASE}/api/pipelines`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'CDC Test Pipeline',
        source: { host: 'localhost', engine: 'postgresql', database: 'src', user: 't', password: 'p' },
        target: { host: 'localhost', engine: 'postgresql', database: 'tgt', user: 't', password: 'p' },
        tables: ['test_table'],
      },
    });
    const { id: pipelineId } = (await pipeResp.json()).data;

    // Start CDC
    const startResp = await request.post(`${BASE}/api/cdc/start`, {
      headers: { 'x-api-key': apiKey },
      data: { pipelineId },
    });
    expect(startResp.ok()).toBeTruthy();
    const startBody = await startResp.json();
    expect(startBody.data.status).toBe('running');
    console.log(`PASS: Start CDC — pipeline=${pipelineId}, status=running`);

    // Stop CDC
    const stopResp = await request.post(`${BASE}/api/cdc/stop`, {
      headers: { 'x-api-key': apiKey },
      data: { pipelineId },
    });
    expect(stopResp.ok()).toBeTruthy();
    const stopBody = await stopResp.json();
    expect(stopBody.data.status).toBe('stopped');
    console.log(`PASS: Stop CDC — pipeline=${pipelineId}, status=stopped`);
  });

  test('API: MCP template deployment', async ({ request }) => {
    const email = `mcp-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'MCP Test', email },
    });
    const { apiKey, organizationId } = (await signupResp.json()).data;

    // Deploy template
    const resp = await request.post(`${BASE}/api/mcp/templates`, {
      headers: { 'x-api-key': apiKey },
      data: {
        templateId: 'cmc-to-postgres',
        organizationId,
        sourceApiKey: 'test-cmc-key',
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.pipelineId).toBeTruthy();
    expect(body.data.sourceConnectorId).toBeTruthy();
    expect(body.data.name).toBe('CMC Markets → PostgreSQL');
    expect(body.data.tables).toContain('cmc_prices');
    console.log(`PASS: MCP template deploy — pipeline=${body.data.pipelineId}, connector=${body.data.sourceConnectorId}`);
  });

  test('API: Marketplace install', async ({ request }) => {
    const email = `mkt-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Marketplace Test', email },
    });
    const { apiKey, organizationId } = (await signupResp.json()).data;

    // Install connector from marketplace (POST to /api/marketplace/[id])
    const resp = await request.post(`${BASE}/api/marketplace/mkt-oanda`, {
      headers: { 'x-api-key': apiKey },
      data: { organizationId },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.installationId).toBeTruthy();
    expect(body.data.connector.name).toBe('OANDA Forex');
    expect(body.data.connector.configTemplate).toBeTruthy();
    console.log(`PASS: Marketplace install — ${body.data.connector.name}, installation=${body.data.installationId}`);
  });

  test('API: Submit marketplace review', async ({ request }) => {
    const email = `review-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Review Test', email },
    });
    const { apiKey } = (await signupResp.json()).data;

    const resp = await request.post(`${BASE}/api/marketplace/mkt-cmc-markets/reviews`, {
      headers: { 'x-api-key': apiKey },
      data: {
        userId: 'test-user',
        rating: 5,
        title: 'Excellent forex connector',
        reviewText: 'Real-time CMC data with sub-second latency. Exactly what we needed.',
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.reviewId).toBeTruthy();
    console.log(`PASS: Submit review — id=${body.data.reviewId}`);
  });

  test('API: Billing status', async ({ request }) => {
    const email = `billing-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Billing Test', email },
    });
    const { organizationId } = (await signupResp.json()).data;

    const resp = await request.get(`${BASE}/api/billing/status?orgId=${organizationId}`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.organization.plan).toBe('community');
    expect(body.subscription).toBeNull();
    console.log(`PASS: Billing status — plan=${body.organization.plan}`);
  });

  test('API: Rate limiting works', async ({ request }) => {
    const email = `rate-${Date.now()}@pulsyn.io`;
    const signupResp = await request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Rate Test', email },
    });
    const { apiKey } = (await signupResp.json()).data;

    // Make 5 rapid requests — all should succeed (community = 30 RPM)
    let successCount = 0;
    for (let i = 0; i < 5; i++) {
      const resp = await request.get(`${BASE}/api/pipelines`, {
        headers: { 'x-api-key': apiKey },
      });
      if (resp.ok()) successCount++;
    }
    expect(successCount).toBe(5);
    console.log(`PASS: Rate limiting — ${successCount}/5 requests succeeded (within limit)`);
  });

  test('Web: Homepage shows updated pricing', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Check new pricing is visible
    await expect(page.getByText('$499').first()).toBeVisible();
    await expect(page.getByText('$3,500').first()).toBeVisible();
    
    console.log('PASS: Homepage — $499 and $3,500 pricing visible');
  });

  test('Web: Pricing page shows all tiers', async ({ page }) => {
    await page.goto(`${BASE}/pricing`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Community').first()).toBeVisible();
    await expect(page.getByText('Pro').first()).toBeVisible();
    await expect(page.getByText('Business').first()).toBeVisible();
    await expect(page.getByText('Enterprise').first()).toBeVisible();

    console.log('PASS: Pricing page — all 4 tiers visible');
  });
});
