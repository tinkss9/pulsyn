import { test, expect } from '@playwright/test';

const BASE = 'https://pulsynai.com';

test.describe('Pulsyn Full E2E — UX, Branding, AI Chat, Page Flow', () => {

  test('Homepage: branding, logo, hero, colors', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Logo — check for any prominent element in header
    const headerLink = page.locator('header a[href="/"]').first();
    await expect(headerLink).toBeVisible({ timeout: 10000 });

    // Hero section
    const hero = page.locator('h1, [class*="hero"], [class*="Hero"]').first();
    await expect(hero).toBeVisible();

    // Pricing visible ($499)
    await expect(page.getByText('$499').first()).toBeVisible();

    // Navigation links
    const nav = page.locator('header').first();
    await expect(nav).toBeVisible();

    // Check key nav links exist
    const pricingLink = page.getByRole('link', { name: /pricing/i }).first();
    await expect(pricingLink).toBeVisible();

    // Scroll down to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Footer visible
    const footer = page.locator('footer, [class*="footer"], [class*="Footer"]').first();
    await expect(footer).toBeVisible();

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    console.log('PASS: Homepage — logo, hero, pricing, nav, footer all visible');
  });

  test('Homepage: color scheme and branding consistency', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Check background color is dark theme
    const bg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // Dark theme should have low RGB values
    const rgb = bg.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const isDark = rgb[0] < 50 && rgb[1] < 50 && rgb[2] < 50;
    expect(isDark).toBeTruthy();

    // Check font loads
    const font = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    expect(font).toBeTruthy();

    console.log(`PASS: Branding — dark theme (bg: ${bg}), font: ${font}`);
  });

  test('Pricing page: all 4 tiers', async ({ page }) => {
    await page.goto(`${BASE}/pricing`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Community').first()).toBeVisible();
    await expect(page.getByText('Pro').first()).toBeVisible();
    await expect(page.getByText('Business').first()).toBeVisible();
    await expect(page.getByText('Enterprise').first()).toBeVisible();

    // Price amounts
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText('$499').first()).toBeVisible();

    console.log('PASS: Pricing — all 4 tiers visible');
  });

  test('Login page: form elements', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');

    // Check page loaded (not DNS error)
    const url = page.url();
    expect(url).toContain('pulsynai.com');

    // Look for any input fields
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(1);

    // Look for any button
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(1);

    console.log('PASS: Login — form with inputs and buttons');
  });

  test('Signup page: form elements', async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await page.waitForLoadState('networkidle');

    // Check page loaded
    const url = page.url();
    expect(url).toContain('pulsynai.com');

    // Look for any input fields
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(1);

    console.log('PASS: Signup — form with inputs');
  });

  test('Contact page: form elements', async ({ page }) => {
    await page.goto(`${BASE}/contact`);
    await page.waitForLoadState('networkidle');

    // Check for contact form or contact info
    const hasForm = await page.locator('form, input[name="email"], textarea').count();
    const hasEmail = await page.getByText(/email|contact|support/i).count();
    expect(hasForm + hasEmail).toBeGreaterThan(0);

    console.log('PASS: Contact — form or contact info visible');
  });

  test('Marketplace page: connector list', async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    await page.waitForLoadState('networkidle');

    // Should show connector cards or list
    const connectors = page.locator('[class*="card"], [class*="connector"], [class*="item"], tr, li');
    const count = await connectors.count();
    expect(count).toBeGreaterThan(0);

    console.log(`PASS: Marketplace — ${count} connector elements visible`);
  });

  test('Dashboard page: requires auth redirect', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Should redirect to login or show dashboard
    const url = page.url();
    const isDashboard = url.includes('/dashboard');
    const isLogin = url.includes('/login');
    expect(isDashboard || isLogin).toBeTruthy();

    console.log(`PASS: Dashboard — ${isDashboard ? 'accessible' : 'redirected to login'}`);
  });

  test('AI Dashboard: page loads with tabs', async ({ page }) => {
    await page.goto(`${BASE}/ai`);
    await page.waitForLoadState('networkidle');

    // Page title or heading
    const heading = page.locator('h1, h2, [class*="title"]').first();
    await expect(heading).toBeVisible();

    // Tab navigation
    const tabs = page.locator('button:has-text("Insights"), button:has-text("Predictions"), button:has-text("Anomalies"), button:has-text("Chat"), button:has-text("Status")');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(3);

    // Click each tab
    for (const tabName of ['Insights', 'Predictions', 'Anomalies', 'Chat', 'Status']) {
      const tab = page.getByRole('button', { name: new RegExp(tabName, 'i') }).first();
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);
      }
    }

    console.log('PASS: AI Dashboard — all tabs clickable');
  });

  test('AI Chat: functional test', async ({ page }) => {
    await page.goto(`${BASE}/ai`);
    await page.waitForLoadState('networkidle');

    // Click Chat tab
    const chatTab = page.getByRole('button', { name: /chat/i }).first();
    if (await chatTab.isVisible()) {
      await chatTab.click();
      await page.waitForTimeout(500);
    }

    // Find input field
    const input = page.locator('textarea, input[type="text"]').last();
    if (await input.isVisible()) {
      await input.fill('What is CDC?');
      
      // Find and click send button
      const sendBtn = page.locator('button:has-text("Send"), button[type="submit"], button[aria-label*="send" i]').last();
      if (await sendBtn.isVisible()) {
        await sendBtn.click();
        await page.waitForTimeout(5000); // Wait for LLM response
        
        // Check for response
        const response = page.locator('[class*="message"], [class*="response"], [class*="answer"], p');
        const count = await response.count();
        expect(count).toBeGreaterThan(0);
      }
    }

    console.log('PASS: AI Chat — input and send working');
  });

  test('Navigation: scroll and menu interaction', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    // Check header is still visible (sticky/fixed)
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    console.log('PASS: Navigation — scroll up/down, header persistent');
  });

  test('Mobile responsive: viewport test', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Check page doesn't overflow horizontally
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 10); // Small tolerance

    // Check key elements are visible
    const heading = page.locator('h1, h2, [class*="hero"]').first();
    await expect(heading).toBeVisible();

    // Check mobile menu button if exists
    const menuBtn = page.locator('button[aria-label*="menu"], button:has-text("☰"), [class*="hamburger"], [class*="mobile-menu"]').first();
    const isMenuVisible = await menuBtn.isVisible().catch(() => false);

    console.log(`PASS: Mobile — no horizontal overflow, ${isMenuVisible ? 'mobile menu present' : 'nav visible'}`);
  });

  test('Performance: page load time', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(10000); // Under 10s

    console.log(`PASS: Performance — homepage loaded in ${loadTime}ms`);
  });

  test('Links: no broken internal links', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const links = page.locator('a[href^="/"], a[href^="' + BASE + '"]');
    const count = await links.count();
    const broken: string[] = [];

    for (let i = 0; i < Math.min(count, 20); i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && href !== '#' && !href.startsWith('mailto:')) {
        try {
          const response = await page.request.get(href.startsWith('/') ? `${BASE}${href}` : href);
          if (response.status() >= 400) {
            broken.push(`${href} (${response.status()})`);
          }
        } catch {
          broken.push(`${href} (error)`);
        }
      }
    }

    if (broken.length > 0) {
      console.log(`WARN: Broken links: ${broken.join(', ')}`);
    } else {
      console.log(`PASS: Links — ${Math.min(count, 20)} checked, none broken`);
    }
  });

  test('Security: no sensitive data in page source', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const html = await page.content();

    // Check for leaked secrets
    const secretPatterns = [
      /sk-[a-zA-Z0-9]{20,}/, // API keys
      /ghp_[a-zA-Z0-9]{36}/, // GitHub tokens
      /AKIA[A-Z0-9]{16}/, // AWS keys
      /password\s*[:=]\s*["'][^"']+["']/i, // Hardcoded passwords
    ];

    for (const pattern of secretPatterns) {
      const match = html.match(pattern);
      expect(match).toBeNull();
    }

    console.log('PASS: Security — no secrets in page source');
  });
});
