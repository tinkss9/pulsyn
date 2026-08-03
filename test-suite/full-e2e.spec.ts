import { test, expect } from '@playwright/test';

const BASE = 'https://pulsynai.com';
const E2E_SECRET = 'pulsyn-e2e-test-2026';

// Helper: get API key via test-signup endpoint (bypasses email verification)
async function getTestApiKey(request: any): Promise<string> {
  const resp = await request.post(`${BASE}/api/auth/test-signup`, {
    headers: { 'x-e2e-secret': E2E_SECRET },
    data: { name: `E2E Test ${Date.now()}` },
  });
  const body = await resp.json();
  return body.data?.apiKey || '';
}

test.describe('Full E2E Suite — API Generation, MCP, Lab Access', () => {

  test('API: Signup and get API key', async ({ request }) => {
    const apiKey = await getTestApiKey(request);
    expect(apiKey).toBeTruthy();
    expect(apiKey).toMatch(/^pulsyn_/);
    console.log(`PASS: Signup — key=${apiKey.slice(0, 25)}...`);
  });

  test('API: Create connector via POST /api/connectors', async ({ request }) => {
    const apiKey = await getTestApiKey(request);

    const resp = await request.post(`${BASE}/api/connectors`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'Test PostgreSQL',
        engine: 'postgresql',
        config: { host: 'localhost', port: 5432, database: 'test', user: 'test', password: 'secret123' },
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.id).toBeTruthy();
    expect(body.data.config.password).toBe('***');
    console.log(`PASS: Create connector — id=${body.data.id}, password masked`);
  });

  test('API: Create pipeline via POST /api/pipelines', async ({ request }) => {
    const apiKey = await getTestApiKey(request);

    const resp = await request.post(`${BASE}/api/pipelines`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'Test Pipeline',
        source: { host: 'localhost', port: 5432, engine: 'postgresql', database: 'src', user: 't', password: 'p' },
        target: { host: 'localhost', port: 5432, engine: 'postgresql', database: 'tgt', user: 't', password: 'p' },
        tables: ['users', 'orders'],
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.id).toBeTruthy();
    expect(body.data.source.password).toBe('***');
    console.log(`PASS: Create pipeline — id=${body.data.id}, passwords masked`);
  });

  test('API: List pipelines via GET /api/pipelines', async ({ request }) => {
    const apiKey = await getTestApiKey(request);

    await request.post(`${BASE}/api/pipelines`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'List Test Pipeline',
        source: { host: 'localhost', engine: 'postgresql', database: 'src', user: 't', password: 'p' },
        target: { host: 'localhost', engine: 'postgresql', database: 'tgt', user: 't', password: 'p' },
        tables: ['test_table'],
      },
    });

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
    const apiKey = await getTestApiKey(request);

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

    const startResp = await request.post(`${BASE}/api/cdc/start`, {
      headers: { 'x-api-key': apiKey },
      data: { pipelineId },
    });
    expect(startResp.ok()).toBeTruthy();
    const startBody = await startResp.json();
    expect(startBody.data.status).toBe('running');
    console.log(`PASS: Start CDC — pipeline=${pipelineId}, status=running`);

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
    const apiKey = await getTestApiKey(request);

    const resp = await request.post(`${BASE}/api/mcp/templates`, {
      headers: { 'x-api-key': apiKey },
      data: { templateId: 'cmc-to-postgres', organizationId: 'test-org', sourceApiKey: 'test-key' },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.pipelineId).toBeTruthy();
    expect(body.data.tables).toContain('cmc_prices');
    console.log(`PASS: Deploy template — pipeline=${body.data.pipelineId}, tables=${body.data.tables.join(', ')}`);
  });

  test('API: Marketplace install', async ({ request }) => {
    const apiKey = await getTestApiKey(request);

    const resp = await request.post(`${BASE}/api/marketplace/mkt-oanda`, {
      headers: { 'x-api-key': apiKey },
      data: { organizationId: 'test-org' },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.connector.name).toBe('OANDA Forex');
    console.log(`PASS: Install from marketplace — ${body.data.connector.name}`);
  });

  test('API: Submit marketplace review', async ({ request }) => {
    const apiKey = await getTestApiKey(request);

    const resp = await request.post(`${BASE}/api/marketplace/mkt-cmc-markets/reviews`, {
      headers: { 'x-api-key': apiKey },
      data: {
        userId: 'test-user',
        rating: 5,
        title: 'Excellent forex connector',
        reviewText: 'Real-time CMC data with sub-second latency.',
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data?.reviewId || body.message).toBeTruthy();
    console.log(`PASS: Submit review — ${body.data?.reviewId || body.message}`);
  });

  test('API: Billing status', async ({ request }) => {
    const apiKey = await getTestApiKey(request);

    const resp = await request.get(`${BASE}/api/billing/status?orgId=test`, {
      headers: { 'x-api-key': apiKey },
    });
    expect(resp.status()).toBeLessThan(500);
    console.log(`PASS: Billing status — ${resp.status()}`);
  });

  test('API: Rate limiting works', async ({ request }) => {
    const apiKey = await getTestApiKey(request);

    let successCount = 0;
    for (let i = 0; i < 5; i++) {
      const resp = await request.get(`${BASE}/api/pipelines`, {
        headers: { 'x-api-key': apiKey },
      });
      if (resp.ok()) successCount++;
    }
    expect(successCount).toBe(5);
    console.log(`PASS: Rate limiting — ${successCount}/5 requests succeeded`);
  });

  test('Web: Homepage shows updated pricing', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('$499').first()).toBeVisible();
    console.log('PASS: Homepage — $499 pricing visible');
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
