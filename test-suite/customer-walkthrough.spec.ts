import { test, expect } from '@playwright/test';

const BASE = 'https://pulsynai.com';

test.describe('Customer Walkthrough — Full Journey', () => {

  test('Step 1: Land on homepage, see value prop', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Hero section
    await expect(page.getByText('Real-time data.').first()).toBeVisible();
    await expect(page.getByText('Zero latency.').first()).toBeVisible();

    // Stats
    await expect(page.getByText('763').first()).toBeVisible();
    await expect(page.getByText('Connectors').first()).toBeVisible();

    // CTA
    await expect(page.getByRole('link', { name: 'Start Free' }).first()).toBeVisible();

    console.log('PASS: Homepage — hero, stats, CTA visible');
    await page.screenshot({ path: 'test-results/walkthrough-01-homepage.png', fullPage: true });
  });

  test('Step 2: Browse marketplace connectors', async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=CMC Markets', { timeout: 15000 });

    // See connector cards
    const cards = page.locator('.bg-gray-900.rounded-lg.p-5');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(6);
    console.log(`PASS: Marketplace — ${count} connector cards visible`);

    // Search for forex
    await page.getByPlaceholder('Search connectors...').fill('forex');
    await page.waitForTimeout(1000);
    await expect(page.getByText('CMC Markets', { exact: true }).first()).toBeVisible();
    console.log('PASS: Marketplace — search works');

    // Filter by category
    await page.locator('select').selectOption('crypto');
    await page.waitForTimeout(2000);
    const cryptoVisible = await page.getByText('DexScreener', { exact: true }).first().isVisible().catch(() => false)
      || await page.getByText('Binance', { exact: true }).first().isVisible().catch(() => false);
    expect(cryptoVisible).toBeTruthy();
    console.log('PASS: Marketplace — category filter works');

    await page.screenshot({ path: 'test-results/walkthrough-02-marketplace.png', fullPage: true });
  });

  test('Step 3: Browse MCP templates', async ({ page }) => {
    await page.goto(`${BASE}/mcp/templates`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=CMC Markets → PostgreSQL', { timeout: 15000 });

    // See template cards
    const deployBtns = page.getByRole('button', { name: 'Deploy Template' });
    const count = await deployBtns.count();
    expect(count).toBeGreaterThanOrEqual(5);
    console.log(`PASS: MCP Templates — ${count} deploy buttons visible`);

    // See code example
    await expect(page.getByText('mcp.createPipeline')).toBeVisible();
    console.log('PASS: MCP Templates — code example visible');

    await page.screenshot({ path: 'test-results/walkthrough-03-mcp-templates.png', fullPage: true });
  });

  test('Step 4: View pricing', async ({ page }) => {
    await page.goto(`${BASE}/pricing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // All 4 tiers
    await expect(page.getByText('Community').first()).toBeVisible();
    await expect(page.getByText('Pro').first()).toBeVisible();
    await expect(page.getByText('Business').first()).toBeVisible();
    await expect(page.getByText('Enterprise').first()).toBeVisible();

    // Pro price
    await expect(page.getByText('$499').first()).toBeVisible();

    console.log('PASS: Pricing — all 4 tiers visible');
    await page.screenshot({ path: 'test-results/walkthrough-04-pricing.png', fullPage: true });
  });

  test('Step 5: Sign up and get API key', async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await page.waitForLoadState('networkidle');

    // Signup form visible
    await expect(page.getByRole('button', { name: /sign up|create/i })).toBeVisible();
    console.log('PASS: Signup — form visible');

    // API signup via browser
    const email = `walkthrough-${Date.now()}@pulsyn.io`;
    const resp = await page.request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Walkthrough Test', email, company: 'Demo Corp' },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.apiKey).toMatch(/^pulsyn_/);
    expect(body.data.organizationId).toBeTruthy();
    console.log(`PASS: Signup — API key obtained: ${body.data.apiKey.slice(0, 25)}...`);

    await page.screenshot({ path: 'test-results/walkthrough-05-signup.png', fullPage: true });
  });

  test('Step 6: Create connector via API', async ({ page }) => {
    const email = `conn-${Date.now()}@pulsyn.io`;
    const signupResp = await page.request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Connector Test', email },
    });
    const { apiKey } = (await signupResp.json()).data;

    const resp = await page.request.post(`${BASE}/api/connectors`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'My PostgreSQL',
        engine: 'postgresql',
        config: { host: 'db.example.com', port: 5432, database: 'mydb', user: 'admin', password: 'secret123' },
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.config.password).toBe('***');
    console.log(`PASS: Create connector — id=${body.data.id}, password masked`);
  });

  test('Step 7: Create pipeline and start CDC', async ({ page }) => {
    const email = `pipe-${Date.now()}@pulsyn.io`;
    const signupResp = await page.request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'Pipeline Test', email },
    });
    const { apiKey } = (await signupResp.json()).data;

    // Create pipeline
    const pipeResp = await page.request.post(`${BASE}/api/pipelines`, {
      headers: { 'x-api-key': apiKey },
      data: {
        name: 'My First Pipeline',
        source: { host: 'source.db.com', engine: 'postgresql', database: 'src', user: 'u', password: 'p' },
        target: { host: 'target.db.com', engine: 'postgresql', database: 'tgt', user: 'u', password: 'p' },
        tables: ['users', 'orders'],
      },
    });
    expect(pipeResp.ok()).toBeTruthy();
    const { id: pipelineId } = (await pipeResp.json()).data;
    console.log(`PASS: Create pipeline — id=${pipelineId}`);

    // Start CDC
    const startResp = await page.request.post(`${BASE}/api/cdc/start`, {
      headers: { 'x-api-key': apiKey },
      data: { pipelineId },
    });
    expect(startResp.ok()).toBeTruthy();
    expect((await startResp.json()).data.status).toBe('running');
    console.log('PASS: Start CDC — status=running');

    // Stop CDC
    const stopResp = await page.request.post(`${BASE}/api/cdc/stop`, {
      headers: { 'x-api-key': apiKey },
      data: { pipelineId },
    });
    expect(stopResp.ok()).toBeTruthy();
    expect((await stopResp.json()).data.status).toBe('stopped');
    console.log('PASS: Stop CDC — status=stopped');
  });

  test('Step 8: Deploy MCP template', async ({ page }) => {
    const email = `mcp-${Date.now()}@pulsyn.io`;
    const signupResp = await page.request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'MCP Test', email },
    });
    const { apiKey, organizationId } = (await signupResp.json()).data;

    const resp = await page.request.post(`${BASE}/api/mcp/templates`, {
      headers: { 'x-api-key': apiKey },
      data: { templateId: 'cmc-to-postgres', organizationId, sourceApiKey: 'demo-cmc-key' },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.pipelineId).toBeTruthy();
    expect(body.data.tables).toContain('cmc_prices');
    console.log(`PASS: Deploy template — pipeline=${body.data.pipelineId}, tables=${body.data.tables.join(', ')}`);
  });

  test('Step 9: Install connector from marketplace', async ({ page }) => {
    const email = `mkt-${Date.now()}@pulsyn.io`;
    const signupResp = await page.request.post(`${BASE}/api/auth/signup`, {
      data: { name: 'MKT Test', email },
    });
    const { apiKey, organizationId } = (await signupResp.json()).data;

    const resp = await page.request.post(`${BASE}/api/marketplace/mkt-oanda`, {
      headers: { 'x-api-key': apiKey },
      data: { organizationId },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.connector.name).toBe('OANDA Forex');
    console.log(`PASS: Install from marketplace — ${body.data.connector.name}`);
  });

  test('Step 10: Check lab demo with real data', async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/lab/demo`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();

    expect(body.demo.liveData.source.customers.length).toBeGreaterThanOrEqual(5);
    expect(body.demo.liveData.source.orders.length).toBeGreaterThanOrEqual(5);
    expect(body.demo.liveData.source.products.length).toBeGreaterThanOrEqual(5);
    expect(body.demo.pipelines.length).toBeGreaterThanOrEqual(1);
    expect(body.demo.cdcStats).toBeTruthy();
    console.log(`PASS: Lab demo — ${body.demo.liveData.source.customers.length} customers, ${body.demo.liveData.source.orders.length} orders, ${body.demo.liveData.source.products.length} products`);
    console.log(`PASS: Lab demo — CDC stats: processed=${body.demo.cdcStats.processed}, pending=${body.demo.cdcStats.pending}`);
  });

  test('Step 11: Submit custom replication request', async ({ page }) => {
    const resp = await page.request.post(`${BASE}/api/custom-replication`, {
      data: {
        offeringId: 'white-label',
        organizationId: 'org-demo',
        requirements: 'White-label CDC for our SaaS product',
        contactEmail: 'cto@bigcorp.com',
        contactName: 'CTO',
      },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.status).toBe('received');
    expect(body.data.nextSteps.length).toBeGreaterThanOrEqual(3);
    console.log(`PASS: Custom replication — ${body.data.message}`);
  });

  test('Step 12: Check AI insights', async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/ai/learn`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();

    expect(body.ai.dataPoints.connectors).toBeGreaterThan(0);
    expect(body.ai.dataPoints.pipelines).toBeGreaterThan(0);
    expect(body.ai.recommendations.length).toBeGreaterThan(0);
    console.log(`PASS: AI insights — ${body.ai.dataPoints.connectors} connectors, ${body.ai.dataPoints.pipelines} pipelines, ${body.ai.recommendations.length} recommendations`);
  });

  test('Step 13: Dashboard walkthrough', async ({ page, context }) => {
    await context.addCookies([{
      name: 'pulsyn_token',
      value: 'test-key',
      domain: 'pulsynai.com',
      path: '/',
    }]);
    await page.goto(`${BASE}/dashboard`);
    await page.evaluate(() => {
      localStorage.setItem('pulsyn_api_key', 'test-key');
      localStorage.setItem('pulsyn_user', JSON.stringify({ name: 'Demo User', email: 'demo@pulsyn.io', plan: 'pro' }));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Sidebar navigation
    await expect(page.locator('a[href="/marketplace"]').first()).toBeAttached();
    await expect(page.locator('a[href="/mcp/templates"]').first()).toBeAttached();
    await expect(page.locator('a[href="/dashboard/usage"]').first()).toBeAttached();

    console.log('PASS: Dashboard — all nav links present');
    await page.screenshot({ path: 'test-results/walkthrough-13-dashboard.png', fullPage: true });
  });
});
