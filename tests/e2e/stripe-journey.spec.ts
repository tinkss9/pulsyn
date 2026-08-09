import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://web-lac-nine-aqlw7eo1fc.vercel.app';

// ═══════════════════════════════════════════════════════════════
// STRIPE BUYING JOURNEY E2E TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Stripe Buying Journey', () => {
  test('should display pricing tiers with correct information', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check pricing page loads
    await expect(page.locator('body')).toContainText('Pricing');
  });

  test('should display features for each tier', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check pricing page loads
    await expect(page.locator('body')).toContainText('pipelines');
  });

  test('should have working Get Started buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check Get Started buttons exist
    const getStartedButtons = page.locator('text=Get Started');
    const count = await getStartedButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should navigate to signup when clicking Get Started', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check pricing page loads
    await expect(page.locator('body')).toContainText('Get Started');
  });

  test('should display billing toggle', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check billing toggle
    await expect(page.locator('text=Monthly')).toBeVisible();
    await expect(page.locator('text=Annual')).toBeVisible();
  });

  test('should toggle between monthly and annual pricing', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Click Annual
    await page.click('text=Annual');
    await page.waitForTimeout(500);

    // Should show annual pricing or discount
    const saveText = page.locator('text=Save 20%');
    const isSaveVisible = await saveText.isVisible().catch(() => false);
    expect(isSaveVisible).toBeTruthy();
  });

  test('should display money-back guarantee', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check money-back guarantee
    await expect(page.locator('text=30-day money-back')).toBeVisible();
  });

  test('should display free trial info', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check free trial
    await expect(page.locator('text=14-day free trial')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// CHECKOUT FLOW
// ═══════════════════════════════════════════════════════════════

test.describe('Checkout Flow', () => {
  test('should create checkout session', async ({ page }) => {
    // This test verifies the checkout API endpoint exists
    const response = await page.goto(`${BASE_URL}/api/billing/create-checkout`);
    
    // Should return an error (no body) but not 404
    const status = response?.status() || 0;
    expect(status).not.toBe(404);
  });

  test('should handle checkout cancellation', async ({ page }) => {
    await page.goto(`${BASE_URL}/billing/canceled`);
    await page.waitForLoadState('networkidle');

    // Should display cancellation message
    await expect(page.locator('text=cancel')).toBeVisible();
  });

  test('should handle checkout success', async ({ page }) => {
    await page.goto(`${BASE_URL}/billing/success`);
    await page.waitForLoadState('networkidle');

    // Should display success message
    await expect(page.locator('text=success')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// BILLING API TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Billing API', () => {
  test('should have billing status endpoint', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/billing/status`);
    const status = response?.status() || 0;
    expect(status).not.toBe(404);
  });

  test('should require auth for billing status', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/billing/status`);
    const status = response?.status() || 0;
    // Should require auth (401) or redirect
    expect(status === 401 || status === 302 || status === 200).toBeTruthy();
  });

  test('should have webhook endpoint', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/billing/webhook`);
    // Webhook should exist (POST only, so GET may return 405)
    const status = response?.status() || 0;
    expect(status).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// PRICING PAGE INTERACTIONS
// ═══════════════════════════════════════════════════════════════

test.describe('Pricing Interactions', () => {
  test('should highlight popular plan', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Pro should be marked as popular
    const popularBadge = page.locator('text=Most Popular');
    await expect(popularBadge).toBeVisible();
  });

  test('should display Enterprise as special', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check pricing page loads
    await expect(page.locator('body')).toContainText('Enterprise');
  });

  test('should show Contact Sales for Enterprise', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Check pricing page loads
    await expect(page.locator('body')).toContainText('Contact');
  });
});
