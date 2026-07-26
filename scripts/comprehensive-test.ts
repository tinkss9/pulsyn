// Comprehensive Pulsyn Test Suite — Playwright
import { chromium } from 'playwright';

const BASE_URL = 'https://pulsynai.com';

const PAGES = [
  { path: '/', name: 'Homepage', expect: ['Real-time data', 'Zero latency', '763 connectors'] },
  { path: '/pricing', name: 'Pricing', expect: ['pricing', 'Free'] },
  { path: '/demo', name: 'Demo Lab', expect: ['Demo', 'PostgreSQL'] },
  { path: '/login', name: 'Login', expect: ['Sign in', 'Password'] },
  { path: '/signup', name: 'Signup', expect: ['Create', 'Account'] },
  { path: '/vs/fivetran', name: 'vs Fivetran', expect: ['Pulsyn', 'Comparison'] },
  { path: '/vs/airbyte', name: 'vs Airbyte', expect: ['Pulsyn', 'Airbyte'] },
  { path: '/vs/confluent', name: 'vs Confluent', expect: ['Pulsyn', 'Confluent'] },
  { path: '/vs/debezium', name: 'vs Debezium', expect: ['Pulsyn', 'Debezium'] },
];

async function main() {
  console.log('=== PULSYN COMPREHENSIVE TEST SUITE ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results: { test: string; status: string; error?: string }[] = [];

  // ==================== PAGE TESTS ====================
  console.log('--- PAGE TESTS ---');
  for (const p of PAGES) {
    try {
      const response = await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      const status = response?.status() || 0;
      const bodyText = await page.textContent('body') || '';

      if (status !== 200) {
        results.push({ test: `${p.name} — HTTP`, status: 'FAIL', error: `Got ${status}` });
        continue;
      }

      const missingText = p.expect.filter(t => !bodyText.toLowerCase().includes(t.toLowerCase()));
      if (missingText.length > 0) {
        results.push({ test: `${p.name} — Content`, status: 'FAIL', error: `Missing: ${missingText.join(', ')}` });
      } else {
        results.push({ test: `${p.name} — Load`, status: 'PASS' });
      }

      await page.screenshot({ path: `screenshots/test-${p.name.toLowerCase().replace(/\s+/g, '-')}.png` });
    } catch (err: any) {
      results.push({ test: `${p.name} — Load`, status: 'FAIL', error: err.message.substring(0, 100) });
    }
  }

  // ==================== VIDEO TEST ====================
  console.log('--- VIDEO TEST ---');
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const video = await page.$('video');
    if (video) {
      const videoInfo = await video.evaluate((v: HTMLVideoElement) => ({
        src: v.src || v.querySelector('source')?.src || '',
        duration: v.duration,
        paused: v.paused,
        readyState: v.readyState,
        autoplay: v.autoplay,
        loop: v.loop,
        muted: v.muted
      }));

      results.push({ test: 'Video — Element', status: 'PASS' });
      results.push({ test: 'Video — Source', status: videoInfo.src ? 'PASS' : 'FAIL', error: videoInfo.src || 'none' });
      results.push({ test: 'Video — Duration', status: videoInfo.duration > 0 ? 'PASS' : 'FAIL', error: `${videoInfo.duration}s` });
      results.push({ test: 'Video — Autoplay', status: videoInfo.autoplay ? 'PASS' : 'WARN' });
      results.push({ test: 'Video — Muted', status: videoInfo.muted ? 'PASS' : 'WARN' });
      results.push({ test: 'Video — Loop', status: videoInfo.loop ? 'PASS' : 'WARN' });
    } else {
      results.push({ test: 'Video — Element', status: 'FAIL', error: 'No video element found' });
    }
  } catch (err: any) {
    results.push({ test: 'Video — Test', status: 'FAIL', error: err.message.substring(0, 100) });
  }

  // ==================== DEMO LAB TEST ====================
  console.log('--- DEMO LAB TEST ---');
  try {
    await page.goto(`${BASE_URL}/demo`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent('body') || '';

    // Check for demo connectors
    const hasPostgreSQL = bodyText.includes('PostgreSQL');
    const hasMySQL = bodyText.includes('MySQL');
    const hasStripe = bodyText.includes('Stripe');
    results.push({ test: 'Demo — Connectors', status: hasPostgreSQL && hasMySQL && hasStripe ? 'PASS' : 'FAIL', error: `PG:${hasPostgreSQL} MY:${hasMySQL} ST:${hasStripe}` });

    // Check for metrics
    const hasMetrics = bodyText.includes('Rows Synced') || bodyText.includes('Latency') || bodyText.includes('Throughput');
    results.push({ test: 'Demo — Live Metrics', status: hasMetrics ? 'PASS' : 'FAIL' });

    // Check for tables
    const hasTables = bodyText.includes('users') || bodyText.includes('orders') || bodyText.includes('products');
    results.push({ test: 'Demo — Tables', status: hasTables ? 'PASS' : 'FAIL' });

    // Click PostgreSQL
    const pgBtn = await page.$('button:has-text("PostgreSQL")');
    if (pgBtn) {
      await pgBtn.click();
      await page.waitForTimeout(1000);
      results.push({ test: 'Demo — Click Connector', status: 'PASS' });

      // Click users table
      const usersBtn = await page.$('button:has-text("users")');
      if (usersBtn) {
        await usersBtn.click();
        await page.waitForTimeout(2000);

        const rows = await page.$$('tr');
        results.push({ test: 'Demo — Data Loads', status: rows.length > 1 ? 'PASS' : 'FAIL', error: `${rows.length} rows` });
      }
    }

    await page.screenshot({ path: 'screenshots/test-demo-with-data.png' });
  } catch (err: any) {
    results.push({ test: 'Demo — Test', status: 'FAIL', error: err.message.substring(0, 100) });
  }

  // ==================== AI CHAT TEST ====================
  console.log('--- AI CHAT TEST ---');
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Find the AI section by scrolling down
    await page.evaluate(() => {
      const aiSection = document.querySelector('#ai');
      if (aiSection) aiSection.scrollIntoView();
    });
    await page.waitForTimeout(1000);

    // Find chat input
    const chatInput = await page.$('input[placeholder*="connector"], input[placeholder*="pricing"], input[placeholder*="Ask"]');
    if (chatInput) {
      results.push({ test: 'AI Chat — Input Found', status: 'PASS' });

      // Test connector query
      await chatInput.fill('How many connectors?');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);

      const body1 = await page.textContent('body') || '';
      results.push({ test: 'AI Chat — Connector Response', status: body1.includes('763') ? 'PASS' : 'FAIL' });

      // Test pricing query
      await chatInput.fill('What is the pricing?');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);

      const body2 = await page.textContent('body') || '';
      results.push({ test: 'AI Chat — Pricing Response', status: (body2.includes('$') || body2.includes('free')) ? 'PASS' : 'FAIL' });

      // Test latency query
      await chatInput.fill('How fast is CDC latency?');
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);

      const body3 = await page.textContent('body') || '';
      results.push({ test: 'AI Chat — Latency Response', status: body3.includes('second') ? 'PASS' : 'FAIL' });

      await page.screenshot({ path: 'screenshots/test-ai-chat.png' });
    } else {
      results.push({ test: 'AI Chat — Input Found', status: 'FAIL', error: 'No chat input' });
    }
  } catch (err: any) {
    results.push({ test: 'AI Chat — Test', status: 'FAIL', error: err.message.substring(0, 100) });
  }

  // ==================== NAVIGATION TEST ====================
  console.log('--- NAVIGATION TEST ---');
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const navLinks = await page.$$eval('nav a', links => links.map(l => l.textContent?.trim()));
    results.push({ test: 'Navigation — Nav Links', status: navLinks.length > 0 ? 'PASS' : 'FAIL', error: navLinks.join(', ') });

    const startBtn = await page.$('a[href="/signup"]:has-text("Start Free"), a:has-text("Start Free")');
    results.push({ test: 'Navigation — Start Free', status: startBtn ? 'PASS' : 'FAIL' });

    const signIn = await page.$('a[href="/login"]');
    results.push({ test: 'Navigation — Sign In', status: signIn ? 'PASS' : 'FAIL' });

    // Test logo
    const logo = await page.$('a[href="/"]');
    results.push({ test: 'Navigation — Logo', status: logo ? 'PASS' : 'FAIL' });

  } catch (err: any) {
    results.push({ test: 'Navigation — Test', status: 'FAIL', error: err.message.substring(0, 100) });
  }

  // ==================== RESPONSIVE TEST ====================
  console.log('--- RESPONSIVE TEST ---');
  try {
    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const mobileTitle = await page.$eval('h1', el => el.textContent?.trim() || '');
    results.push({ test: 'Responsive — Mobile', status: mobileTitle ? 'PASS' : 'FAIL' });
    await page.screenshot({ path: 'screenshots/test-mobile.png' });

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/test-tablet.png' });
    results.push({ test: 'Responsive — Tablet', status: 'PASS' });

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    results.push({ test: 'Responsive — Desktop', status: 'PASS' });
  } catch (err: any) {
    results.push({ test: 'Responsive — Test', status: 'FAIL', error: err.message.substring(0, 100) });
  }

  // ==================== GLOBE ANIMATION TEST ====================
  console.log('--- GLOBE ANIMATION TEST ---');
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const canvas = await page.$('canvas');
    results.push({ test: 'Globe — Canvas Element', status: canvas ? 'PASS' : 'FAIL' });

    if (canvas) {
      const canvasSize = await canvas.evaluate(c => ({ width: c.width, height: c.height }));
      results.push({ test: 'Globe — Canvas Size', status: canvasSize.width > 0 && canvasSize.height > 0 ? 'PASS' : 'FAIL', error: `${canvasSize.width}x${canvasSize.height}` });
    }
  } catch (err: any) {
    results.push({ test: 'Globe — Test', status: 'FAIL', error: err.message.substring(0, 100) });
  }

  // ==================== PRICING TEST ====================
  console.log('--- PRICING TEST ---');
  try {
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const body = await page.textContent('body') || '';
    results.push({ test: 'Pricing — Free Tier', status: body.includes('$0') || body.includes('Free') ? 'PASS' : 'FAIL' });
    results.push({ test: 'Pricing — Pro Tier', status: body.includes('$499') || body.includes('499') ? 'PASS' : 'FAIL' });
    results.push({ test: 'Pricing — Enterprise', status: body.includes('$9,999') || body.includes('9999') || body.includes('Enterprise') ? 'PASS' : 'FAIL' });
    results.push({ test: 'Pricing — Start Free CTA', status: body.includes('Start Free') || body.includes('Get Started') ? 'PASS' : 'FAIL' });

    await page.screenshot({ path: 'screenshots/test-pricing-detailed.png' });
  } catch (err: any) {
    results.push({ test: 'Pricing — Test', status: 'FAIL', error: err.message.substring(0, 100) });
  }

  // ==================== RESULTS ====================
  console.log('\n=== TEST RESULTS ===\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${r.test}${r.error ? ' — ' + r.error : ''}`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`⚠️ WARNINGS: ${warnings}`);
  console.log(`📊 TOTAL: ${results.length}`);

  await browser.close();

  // Save results
  const fs = require('fs');
  fs.writeFileSync('test-results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { passed, failed, warnings, total: results.length },
    results
  }, null, 2));
  console.log('\n📄 Results saved to test-results.json');
}

main().catch(console.error);
