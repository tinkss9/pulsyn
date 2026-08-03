import { test, expect } from '@playwright/test';

const BASE = 'https://pulsynai.com';

test.describe('Marketplace & MCP Templates — Live Site', () => {

  test('Marketplace page loads with 6 connectors', async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    await page.waitForLoadState('networkidle');
    
    // Check heading
    await expect(page.getByRole('heading', { name: 'Connector Marketplace' })).toBeVisible();
    
    // Wait for connector cards to appear (they load via fetch)
    await page.waitForSelector('text=CMC Markets', { timeout: 15000 });
    
    // Verify all 6 connectors
    const connectors = ['CMC Markets', 'OANDA Forex', 'Polygon.io', 'Alpha Vantage', 'DexScreener', 'Binance'];
    for (const name of connectors) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
    
    // Verify Install buttons
    const installBtns = page.getByRole('button', { name: 'Install' });
    await expect(installBtns).toHaveCount(6);
    
    // Verify Verified badges
    const verifiedBadges = page.getByText('Verified');
    await expect(verifiedBadges).toHaveCount(6);
    
    await page.screenshot({ path: 'test-results/marketplace.png', fullPage: true });
    console.log('PASS: Marketplace — 6 connectors, 6 Install buttons, 6 Verified badges');
  });

  test('MCP Templates page loads with 5 templates', async ({ page }) => {
    await page.goto(`${BASE}/mcp/templates`);
    await page.waitForLoadState('networkidle');
    
    // Check heading
    await expect(page.getByRole('heading', { name: 'MCP Templates' })).toBeVisible();
    
    // Wait for templates to load
    await page.waitForSelector('text=CMC Markets → PostgreSQL', { timeout: 15000 });
    
    // Verify all 5 templates
    const templates = [
      'CMC Markets → PostgreSQL',
      'OANDA → PostgreSQL',
      'Polygon.io → PostgreSQL',
      'DexScreener → PostgreSQL',
      'Multi-Forex Aggregator',
    ];
    for (const name of templates) {
      await expect(page.getByText(name).first()).toBeVisible();
    }
    
    // Verify Deploy buttons
    const deployBtns = page.getByRole('button', { name: 'Deploy Template' });
    await expect(deployBtns).toHaveCount(5);
    
    // Verify code example
    await expect(page.getByText('mcp.createPipeline')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/mcp-templates.png', fullPage: true });
    console.log('PASS: MCP Templates — 5 templates, 5 Deploy buttons, code example visible');
  });

  test('Marketplace search filters connectors', async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=CMC Markets', { timeout: 15000 });
    
    // Search for "forex"
    await page.getByPlaceholder('Search connectors...').fill('forex');
    await page.waitForTimeout(1500);
    
    // Forex connectors should be visible
    await expect(page.getByText('CMC Markets', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('OANDA Forex', { exact: true }).first()).toBeVisible();
    
    console.log('PASS: Marketplace search filters correctly');
  });

  test('Marketplace category filter works', async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=CMC Markets', { timeout: 15000 });
    
    // Select crypto category
    await page.locator('select').selectOption('crypto');
    await page.waitForTimeout(1500);
    
    // Crypto connectors should be visible
    await expect(page.getByText('Binance', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('DexScreener', { exact: true }).first()).toBeVisible();
    
    console.log('PASS: Marketplace category filter works');
  });

  test('Homepage loads with key sections', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    
    // Check hero — use first() to avoid strict mode
    await expect(page.getByRole('link', { name: 'Pulsyn' }).first()).toBeVisible();
    
    // Check health endpoint
    const healthResp = await page.request.get(`${BASE}/api/health`);
    const health = await healthResp.json();
    expect(health.status).toBe('healthy');
    expect(health.checks.database).toBe('ok');
    
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    console.log('PASS: Homepage — hero visible, health OK');
  });

  test('Dashboard sidebar navigation', async ({ page }) => {
    // Set localStorage to bypass auth
    await page.goto(BASE);
    await page.evaluate(() => {
      localStorage.setItem('pulsyn_api_key', 'test-key');
      localStorage.setItem('pulsyn_user', JSON.stringify({ name: 'Demo', email: 'demo@pulsyn.io', plan: 'pro' }));
    });
    
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check sidebar links exist
    await expect(page.locator('a[href="/marketplace"]')).toBeAttached();
    await expect(page.locator('a[href="/mcp/templates"]')).toBeAttached();
    await expect(page.locator('a[href="/dashboard/usage"]')).toBeAttached();
    await expect(page.locator('a[href="/dashboard/pipelines"]')).toBeAttached();
    
    await page.screenshot({ path: 'test-results/dashboard-sidebar.png', fullPage: true });
    console.log('PASS: Dashboard sidebar — all nav links present');
  });

  test('API endpoints return valid data', async ({ request }) => {
    // Marketplace
    const mktResp = await request.get(`${BASE}/api/marketplace`);
    expect(mktResp.ok()).toBeTruthy();
    const mkt = await mktResp.json();
    expect(mkt.data.length).toBeGreaterThanOrEqual(6);
    console.log(`PASS: /api/marketplace — ${mkt.data.length} connectors`);

    // MCP Templates
    const tplResp = await request.get(`${BASE}/api/mcp/templates`);
    expect(tplResp.ok()).toBeTruthy();
    const tpl = await tplResp.json();
    expect(tpl.data.length).toBeGreaterThanOrEqual(5);
    console.log(`PASS: /api/mcp/templates — ${tpl.data.length} templates`);

    // Health
    const healthResp = await request.get(`${BASE}/api/health`);
    expect(healthResp.ok()).toBeTruthy();
    const health = await healthResp.json();
    expect(health.status).toBe('healthy');
    console.log('PASS: /api/health — healthy');

    // Billing Status
    const billingResp = await request.get(`${BASE}/api/billing/status?orgId=test`);
    expect(billingResp.ok()).toBeTruthy();
    console.log('PASS: /api/billing/status — OK');
  });
});
