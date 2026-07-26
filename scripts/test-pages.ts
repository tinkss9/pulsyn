// Playwright headed test — reviews all pages visually
import { chromium } from 'playwright';

const PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/demo', name: 'Demo Lab' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Signup' },
  { path: '/vs/fivetran', name: 'vs Fivetran' },
  { path: '/vs/airbyte', name: 'vs Airbyte' },
];

async function testPages() {
  const browser = await chromium.launch({ headless: false }); // Headed mode
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results: { name: string; status: string; issues: string[] }[] = [];

  for (const p of PAGES) {
    console.log(`\n=== Testing: ${p.name} (${p.path}) ===`);
    const issues: string[] = [];

    try {
      const response = await page.goto(`https://pulsynai.com${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      
      if (!response || response.status() !== 200) {
        issues.push(`HTTP ${response?.status() || 'timeout'}`);
      }

      // Check for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Check title
      const title = await page.title();
      console.log(`  Title: ${title}`);
      if (!title || title.includes('404')) issues.push('Missing or 404 title');

      // Check for broken images
      const images = await page.$$eval('img', imgs => 
        imgs.map(img => ({ src: img.src, broken: !img.complete || img.naturalHeight === 0 }))
      );
      const brokenImages = images.filter(i => i.broken);
      if (brokenImages.length > 0) {
        issues.push(`${brokenImages.length} broken images`);
      }

      // Check for text visibility (contrast)
      const h1 = await page.$eval('h1', el => {
        const style = window.getComputedStyle(el);
        return { color: style.color, fontSize: style.fontSize, visible: el.offsetHeight > 0 };
      }).catch(() => null);
      if (h1 && !h1.visible) issues.push('H1 not visible');

      // Check for buttons/links
      const buttons = await page.$$eval('a, button', els => els.length);
      if (buttons === 0) issues.push('No interactive elements');

      // Take screenshot
      await page.screenshot({ path: `screenshots/${p.name.toLowerCase().replace(/\s+/g, '-')}.png`, fullPage: false });

      const status = issues.length === 0 ? 'PASS' : 'ISSUES';
      results.push({ name: p.name, status, issues });
      console.log(`  Status: ${status}`);
      if (issues.length > 0) console.log(`  Issues: ${issues.join(', ')}`);

    } catch (err: any) {
      results.push({ name: p.name, status: 'ERROR', issues: [err.message] });
      console.log(`  ERROR: ${err.message}`);
    }
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'ISSUES' ? '⚠️' : '❌';
    console.log(`${icon} ${r.name}: ${r.status}${r.issues.length > 0 ? ' — ' + r.issues.join(', ') : ''}`);
  }

  await browser.close();
}

testPages().catch(console.error);
