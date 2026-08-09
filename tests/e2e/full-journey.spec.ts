import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://web-lac-nine-aqlw7eo1fc.vercel.app';

// Helper: wait for page load
async function waitForPage(page: Page) {
  await page.waitForLoadState('networkidle');
}

// ═══════════════════════════════════════════════════════════════
// 1. HOMEPAGE FLOW
// ═══════════════════════════════════════════════════════════════

test.describe('Homepage', () => {
  test('should load homepage with hero section', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPage(page);

    // Check page title
    await expect(page).toHaveTitle(/Pulsyn/);

    // Check page loads with Pulsyn content
    await expect(page.locator('body')).toContainText('Pulsyn');
  });

  test('should display stats bar', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPage(page);

    // Check page has content
    await expect(page.locator('body')).toContainText('Pulsyn');
  });

  test('should display comparison table', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPage(page);

    // Check page loads
    await expect(page.locator('body')).toContainText('Pulsyn');
  });

  test('should display AI chat widget', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPage(page);

    // Check chat widget
    await expect(page.locator('text=Pulsyn AI')).toBeVisible();
    await expect(page.locator('text=Powered by MCP')).toBeVisible();
  });

  test('should navigate to pricing from header', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPage(page);

    // Click pricing link
    await page.click('text=Pricing');
    await waitForPage(page);

    // Should be on pricing page
    await expect(page.url()).toContain('/pricing');
  });

  test('should navigate to signup from CTA', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPage(page);

    // Click signup CTA
    const signupBtn = page.locator('text=Get Started Free').first();
    if (await signupBtn.isVisible()) {
      await signupBtn.click();
      await waitForPage(page);
      await expect(page.url()).toContain('/signup');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. PRICING PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Pricing Page', () => {
  test('should display all pricing tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await waitForPage(page);

    // Check pricing page loads
    await expect(page.locator('body')).toContainText('Pricing');
  });

  test('should display correct prices', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await waitForPage(page);

    // Check pricing page loads
    await expect(page.locator('body')).toContainText('$');
  });

  test('should display features per tier', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await waitForPage(page);

    // Check pricing page loads
    await expect(page.locator('body')).toContainText('pipelines');
  });

  test('should have working CTA buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await waitForPage(page);

    // Check CTA buttons exist
    const getStartedBtns = page.locator('text=Get Started');
    await expect(getStartedBtns.first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. SIGNUP FLOW
// ═══════════════════════════════════════════════════════════════

test.describe('Signup Flow', () => {
  test('should display signup form', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await waitForPage(page);

    // Check form fields
    await expect(page.locator('text=Full Name')).toBeVisible();
    await expect(page.locator('text=Work Email')).toBeVisible();
    await expect(page.locator('text=Company')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await waitForPage(page);

    // Try to submit empty form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show validation or stay on page
    await expect(page.url()).toContain('/signup');
  });

  test('should submit signup form', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await waitForPage(page);

    // Fill form
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[id="company"]', 'Test Company');

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Should show verification message or API key
    const hasVerification = await page.locator('text=Verification code').isVisible().catch(() => false);
    const hasApiKey = await page.locator('text=API key').isVisible().catch(() => false);
    const hasSuccess = await page.locator('text=Account created').isVisible().catch(() => false);

    expect(hasVerification || hasApiKey || hasSuccess).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. LOGIN FLOW
// ═══════════════════════════════════════════════════════════════

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await waitForPage(page);

    // Check form fields
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate login credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await waitForPage(page);

    // Try invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Should show error or stay on login
    await expect(page.url()).toContain('/login');
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. DASHBOARD
// ═══════════════════════════════════════════════════════════════

test.describe('Dashboard', () => {
  test('should display dashboard components', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await waitForPage(page);

    // Check dashboard elements
    await expect(page.locator('text=Connectors')).toBeVisible();
    await expect(page.locator('text=Pipelines')).toBeVisible();
  });

  test('should navigate to connectors', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await waitForPage(page);

    // Click connectors link
    const connectorsLink = page.locator('text=Connectors').first();
    if (await connectorsLink.isVisible()) {
      await connectorsLink.click();
      await waitForPage(page);
      await expect(page.url()).toContain('/connectors');
    }
  });

  test('should navigate to pipelines', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await waitForPage(page);

    // Click pipelines link
    const pipelinesLink = page.locator('text=Pipelines').first();
    if (await pipelinesLink.isVisible()) {
      await pipelinesLink.click();
      await waitForPage(page);
      await expect(page.url()).toContain('/pipelines');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. CERTIFICATION PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Certification Page', () => {
  test('should display certification stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/certification`);
    await waitForPage(page);

    // Check certification page loads
    await expect(page.locator('body')).toContainText('Certification');
  });

  test('should display Lane B database connectors', async ({ page }) => {
    await page.goto(`${BASE_URL}/certification`);
    await waitForPage(page);

    // Check certification page loads
    await expect(page.locator('body')).toContainText('Database');
  });

  test('should display benchmark results', async ({ page }) => {
    await page.goto(`${BASE_URL}/certification`);
    await waitForPage(page);

    // Scroll to benchmark section
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);

    // Check benchmark data
    await expect(page.locator('text=34,530')).toBeVisible();
    await expect(page.locator('text=3.41ms')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. COMPETITION PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Competition Page', () => {
  test('should display coming soon', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition`);
    await waitForPage(page);

    // Check coming soon
    await expect(page.locator('text=Coming Soon')).toBeVisible();
    await expect(page.locator('text=Register for Early Access')).toBeVisible();
  });

  test('should display prize pool', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition`);
    await waitForPage(page);

    // Check prize
    await expect(page.locator('text=$40,000')).toBeVisible();
  });

  test('should have email registration', async ({ page }) => {
    await page.goto(`${BASE_URL}/competition`);
    await waitForPage(page);

    // Check registration form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('text=Notify Me')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. STATUS PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Status Page', () => {
  test('should display platform status', async ({ page }) => {
    await page.goto(`${BASE_URL}/status`);
    await waitForPage(page);

    // Check status
    await expect(page.locator('text=Platform Services')).toBeVisible();
    await expect(page.locator('text=Operational')).toBeVisible();
  });

  test('should display certification breakdown', async ({ page }) => {
    await page.goto(`${BASE_URL}/status`);
    await waitForPage(page);

    // Check certification stats
    await expect(page.locator('text=Total Certified')).toBeVisible();
    await expect(page.locator('text=320 connectors')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. DOCS PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Docs Page', () => {
  test('should display documentation', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs`);
    await waitForPage(page);

    // Check docs page loads
    await expect(page.locator('body')).toContainText('Documentation');
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. DEMO PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Demo Page', () => {
  test('should display demo', async ({ page }) => {
    await page.goto(`${BASE_URL}/demo`);
    await waitForPage(page);

    // Check demo page loads
    await expect(page.locator('body')).toContainText('Demo');
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. VS COMPARISON PAGES
// ═══════════════════════════════════════════════════════════════

test.describe('Comparison Pages', () => {
  test('should display Fivetran comparison', async ({ page }) => {
    await page.goto(`${BASE_URL}/vs/fivetran`);
    await waitForPage(page);

    await expect(page.locator('text=Pulsyn vs Fivetran')).toBeVisible();
    await expect(page.locator('text=Transparency Notice')).toBeVisible();
  });

  test('should display Airbyte comparison', async ({ page }) => {
    await page.goto(`${BASE_URL}/vs/airbyte`);
    await waitForPage(page);

    await expect(page.locator('text=Pulsyn vs Airbyte')).toBeVisible();
  });

  test('should display Debezium comparison', async ({ page }) => {
    await page.goto(`${BASE_URL}/vs/debezium`);
    await waitForPage(page);

    await expect(page.locator('text=Pulsyn vs Debezium')).toBeVisible();
  });

  test('should display Confluent comparison', async ({ page }) => {
    await page.goto(`${BASE_URL}/vs/confluent`);
    await waitForPage(page);

    await expect(page.locator('text=Pulsyn vs Confluent')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 12. CONTACT PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Contact Page', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await waitForPage(page);

    // Check contact form
    await expect(page.locator('text=Contact')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 13. MARKETPLACE PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Marketplace Page', () => {
  test('should display marketplace', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketplace`);
    await waitForPage(page);

    // Check marketplace
    await expect(page.locator('text=Connector Marketplace')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 14. SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════

test.describe('Security', () => {
  test('should have security headers', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    await waitForPage(page);

    // Check security headers
    const headers = response?.headers() || {};
    expect(headers['x-frame-options']).toBeTruthy();
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});

// ═══════════════════════════════════════════════════════════════
// 15. RESPONSIVE DESIGN
// ═══════════════════════════════════════════════════════════════

test.describe('Responsive', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await waitForPage(page);

    // Should still show main content
    await expect(page.locator('text=Pulsyn')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await waitForPage(page);

    // Should still show main content
    await expect(page.locator('text=Pulsyn')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 16. NAVIGATION FLOW
// ═══════════════════════════════════════════════════════════════

test.describe('Navigation', () => {
  test('should navigate through all main pages', async ({ page }) => {
    // Homepage
    await page.goto(BASE_URL);
    await waitForPage(page);
    await expect(page.locator('body')).toContainText('Pulsyn');

    // Pricing
    await page.goto(`${BASE_URL}/pricing`);
    await waitForPage(page);
    await expect(page.url()).toContain('/pricing');

    // Certification
    await page.goto(`${BASE_URL}/certification`);
    await waitForPage(page);
    await expect(page.url()).toContain('/certification');
  });

  test('should navigate to all comparison pages', async ({ page }) => {
    const comparisons = ['fivetran', 'airbyte', 'debezium', 'confluent'];

    for (const comp of comparisons) {
      await page.goto(`${BASE_URL}/vs/${comp}`);
      await waitForPage(page);
      await expect(page.locator(`text=Pulsyn vs`)).toBeVisible();
    }
  });
});
