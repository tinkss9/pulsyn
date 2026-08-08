import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://pulsynai.com';

test.describe('Competition Leaderboard — Real Data', () => {

  test('page loads and shows real stats from database', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition/leaderboard`);
    await expect(page.locator('h1')).toContainText('Leaderboard');

    // Wait for stats to load (not "—")
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="stat-total-competitors"]');
      return el && el.textContent && el.textContent !== '—' && el.textContent !== 'Loading';
    }, { timeout: 15000 });

    const totalCompetitors = await page.locator('[data-testid="stat-total-competitors"]').textContent();
    const peakRps = await page.locator('[data-testid="stat-peak-rps"]').textContent();
    const countries = await page.locator('[data-testid="stat-countries"]').textContent();
    const totalRows = await page.locator('[data-testid="stat-total-rows"]').textContent();

    console.log('Stats from DB:', { totalCompetitors, peakRps, countries, totalRows });

    // Stats should be real numbers
    expect(totalCompetitors).not.toBe('—');
    expect(peakRps).not.toBe('—');

    // Total competitors should be >= 40 (we seeded 50)
    const count = parseInt(totalCompetitors!.replace(/[^0-9]/g, ''));
    expect(count).toBeGreaterThanOrEqual(40);
  });

  test('leaderboard table shows real competitors from database', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition/leaderboard`);

    // Wait for table to appear
    await page.waitForSelector('[data-testid="leaderboard-table"]', { timeout: 15000 });

    // First row should be rank #1
    const firstRow = page.locator('[data-testid="row-1"]');
    await expect(firstRow).toBeVisible();
    await expect(firstRow).toContainText('#1');

    // First competitor should be DataPipe_Pro (highest score in our seed data)
    const nameCell = firstRow.locator('td').nth(1);
    const name = await nameCell.textContent();
    console.log('Top competitor:', name?.trim());
    expect(name).toContain('DataPipe_Pro');

    // Should have at least 40 rows
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
    await page.waitForTimeout(1500); // Wait for debounced fetch

    const rows = page.locator('tr[data-testid^="row-"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // The visible row should contain CDCNinja
    const firstRowText = await rows.first().textContent();
    expect(firstRowText).toContain('CDCNinja');
  });

  test('country filter works', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition/leaderboard`);
    await page.waitForSelector('[data-testid="leaderboard-table"]', { timeout: 15000 });

    // Filter by NZ
    await page.locator('[data-testid="filter-country"]').selectOption('NZ');
    await page.waitForTimeout(1500);

    const rows = page.locator('tr[data-testid^="row-"]');
    const count = await rows.count();
    console.log(`NZ competitors: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);

    // All visible rows should have NZ
    for (let i = 0; i < Math.min(count, 3); i++) {
      const text = await rows.nth(i).textContent();
      expect(text).toContain('NZ');
    }
  });

  test('API endpoint returns real data', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/competition/leaderboard?limit=5`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.meta).toBeDefined();
    expect(body.data.length).toBeGreaterThan(0);

    const first = body.data[0];
    expect(first.name).toBeDefined();
    expect(first.rowsPerSec).toBeGreaterThan(0);
    expect(first.score).toBeGreaterThan(0);
    expect(first.country).toBeDefined();

    console.log('API response:', {
      total: body.meta.totalCompetitors,
      peak: body.meta.peakRowsPerSec,
      top: first.name,
      score: first.score,
    });
  });

  test('stats have real values (not hardcoded 2847)', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/competition/leaderboard?limit=1`);
    const body = await res.json();

    // The old mock had exactly 2847 — real data should be different
    const total = body.meta.totalCompetitors;
    console.log('Total competitors:', total);
    expect(total).not.toBe(2847); // Not the old hardcoded value
    expect(total).toBeGreaterThanOrEqual(40);
  });
});
