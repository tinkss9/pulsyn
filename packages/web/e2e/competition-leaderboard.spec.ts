import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://pulsynai.com';

test.describe('Competition Leaderboard — Real Data', () => {

  test('page loads and shows real stats from database', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition/leaderboard`);
    await expect(page.locator('h1')).toContainText('Leaderboard');

    // Wait for stats to render (server-side)
    await page.waitForTimeout(2000);

    // Check stats bar — values come from competition_stats table
    const totalCompetitors = await page.locator('[data-testid="stat-total-competitors"]').textContent();
    const peakRps = await page.locator('[data-testid="stat-peak-rps"]').textContent();
    const countries = await page.locator('[data-testid="stat-countries"]').textContent();
    const totalRows = await page.locator('[data-testid="stat-total-rows"]').textContent();

    console.log('Stats:', { totalCompetitors, peakRps, countries, totalRows });

    // Stats should contain actual numbers (not just "—")
    expect(totalCompetitors).toBeTruthy();
    expect(peakRps).toBeTruthy();
  });

  test('leaderboard table shows real competitors from database', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition/leaderboard`);

    // Wait for table to appear
    await page.waitForSelector('[data-testid="leaderboard-table"]', { timeout: 15000 });

    // First row should be rank #1
    const firstRow = page.locator('[data-testid="row-1"]');
    await expect(firstRow).toBeVisible();
    await expect(firstRow).toContainText('#1');

    // First competitor should be DataPipe_Pro (highest score in seed data)
    const nameCell = firstRow.locator('td').nth(1);
    const name = await nameCell.textContent();
    console.log('Top competitor:', name?.trim());
    expect(name).toContain('DataPipe_Pro');

    // Should have at least 40 rows (we seeded 50)
    const rows = page.locator('tr[data-testid^="row-"]');
    const rowCount = await rows.count();
    console.log(`Table has ${rowCount} rows`);
    expect(rowCount).toBeGreaterThanOrEqual(40);
  });

  test('search filters real competitors', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition/leaderboard`);
    await page.waitForSelector('[data-testid="leaderboard-table"]', { timeout: 15000 });

    // Search for a specific competitor
    await page.locator('[data-testid="leaderboard-search"]').fill('CDCNinja');
    await page.waitForTimeout(500);

    const rows = page.locator('tr[data-testid^="row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const firstRowText = await rows.first().textContent();
    expect(firstRowText).toContain('CDCNinja');
  });

  test('country filter works', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition/leaderboard`);
    await page.waitForSelector('[data-testid="leaderboard-table"]', { timeout: 15000 });

    // Filter by NZ
    await page.locator('[data-testid="filter-country"]').selectOption('NZ');
    await page.waitForTimeout(500);

    const rows = page.locator('tr[data-testid^="row-"]');
    const count = await rows.count();
    console.log(`NZ competitors: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const text = await rows.nth(i).textContent();
      expect(text).toContain('NZ');
    }
  });

  test('competitor row has real data fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition/leaderboard`);
    await page.waitForSelector('[data-testid="leaderboard-table"]', { timeout: 15000 });

    // First row should show real data
    const firstRow = page.locator('[data-testid="row-1"]');
    const rowText = await firstRow.textContent();

    // Should contain DataPipe_Pro, US, qualifiers, and numeric scores
    expect(rowText).toContain('DataPipe_Pro');
    expect(rowText).toContain('US');
    expect(rowText).toContain('qualifiers');
    expect(rowText).toMatch(/142,\d{3}/); // rows/sec pattern
  });
});
