// Headed Playwright — Click every nav link, screenshot every page, check text visibility
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('=== HEADED PLAYWRIGHT — FULL PAGE REVIEW ===\n');

  // 1. Homepage
  console.log('--- HOMEPAGE ---');
  await page.goto('https://pulsynai.com', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/01-homepage-top.png', fullPage: false });

  // Check hero text visibility
  const h1 = await page.$eval('h1', el => {
    const style = window.getComputedStyle(el);
    return { text: el.textContent, color: style.color, opacity: style.opacity, display: style.display };
  }).catch(() => null);
  console.log('H1:', h1);

  // Scroll down to Features section
  console.log('\n--- CLICKING: Features ---');
  const featuresLink = await page.$('a[href="#features"]');
  if (featuresLink) {
    await featuresLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/02-homepage-features.png', fullPage: false });
    
    // Check if Features section text is visible
    const featuresText = await page.textContent('#features') || '';
    console.log('Features section text length:', featuresText.length);
    console.log('Features first 200 chars:', featuresText.substring(0, 200));
    
    // Check for h2 in Features
    const h2 = await page.$eval('#features h2', el => el.textContent).catch(() => 'NO H2');
    console.log('Features H2:', h2);
  }

  // Scroll down to Connectors section
  console.log('\n--- CLICKING: Connectors ---');
  const connectorsLink = await page.$('a[href="#connectors"]');
  if (connectorsLink) {
    await connectorsLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/03-homepage-connectors.png', fullPage: false });
    
    const connectorsText = await page.textContent('#connectors') || '';
    console.log('Connectors section text length:', connectorsText.length);
    console.log('Connectors first 200 chars:', connectorsText.substring(0, 200));
  }

  // Scroll down to AI section
  console.log('\n--- CLICKING: AI ---');
  const aiLink = await page.$('a[href="#ai"]');
  if (aiLink) {
    await aiLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/04-homepage-ai.png', fullPage: false });
    
    const aiText = await page.textContent('#ai') || '';
    console.log('AI section text length:', aiText.length);
    console.log('AI first 200 chars:', aiText.substring(0, 200));
  }

  // Scroll down to Pricing section
  console.log('\n--- CLICKING: Pricing ---');
  const pricingLink = await page.$('a[href="#pricing"]');
  if (pricingLink) {
    await pricingLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/05-homepage-pricing.png', fullPage: false });
    
    const pricingText = await page.textContent('#pricing') || '';
    console.log('Pricing section text length:', pricingText.length);
  }

  // Full page screenshot
  await page.screenshot({ path: 'screenshots/06-homepage-full.png', fullPage: true });

  // 2. Navigate to each page via nav links
  const navPages = [
    { selector: 'a[href="/demo"]', name: 'Demo', file: '07-demo.png' },
    { selector: 'a[href="/pricing"]', name: 'Pricing', file: '08-pricing.png' },
    { selector: 'a[href="/login"]', name: 'Login', file: '09-login.png' },
    { selector: 'a[href="/signup"]', name: 'Signup', file: '10-signup.png' },
  ];

  for (const nav of navPages) {
    console.log(`\n--- NAVIGATING: ${nav.name} ---`);
    await page.goto('https://pulsynai.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    
    const link = await page.$(nav.selector);
    if (link) {
      await link.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `screenshots/${nav.file}`, fullPage: false });
      
      const bodyText = await page.textContent('body') || '';
      const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'NO H1');
      console.log(`  H1: ${h1Text}`);
      console.log(`  Body text length: ${bodyText.length}`);
      console.log(`  First 100 chars: ${bodyText.substring(0, 100)}`);
    } else {
      console.log(`  Link not found: ${nav.selector}`);
    }
  }

  // 3. Comparison pages
  const compPages = [
    { url: '/vs/fivetran', name: 'vs Fivetran', file: '11-vs-fivetran.png' },
    { url: '/vs/airbyte', name: 'vs Airbyte', file: '12-vs-airbyte.png' },
    { url: '/vs/confluent', name: 'vs Confluent', file: '13-vs-confluent.png' },
    { url: '/vs/debezium', name: 'vs Debezium', file: '14-vs-debezium.png' },
  ];

  for (const comp of compPages) {
    console.log(`\n--- NAVIGATING: ${comp.name} ---`);
    await page.goto(`https://pulsynai.com${comp.url}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `screenshots/${comp.file}`, fullPage: false });
    
    const bodyText = await page.textContent('body') || '';
    const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'NO H1');
    console.log(`  H1: ${h1Text}`);
    console.log(`  Body text length: ${bodyText.length}`);
  }

  // 4. Dashboard (may timeout)
  console.log('\n--- NAVIGATING: Dashboard ---');
  try {
    await page.goto('https://pulsynai.com/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/15-dashboard.png', fullPage: false });
    const dashText = await page.textContent('body') || '';
    console.log(`  Body text length: ${dashText.length}`);
  } catch (err) {
    console.log('  Dashboard timeout (expected)');
  }

  // 5. Mobile viewport
  console.log('\n--- MOBILE VIEWPORT ---');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://pulsynai.com', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/16-mobile-homepage.png', fullPage: false });
  console.log('  Mobile homepage captured');

  await page.goto('https://pulsynai.com/pricing', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/17-mobile-pricing.png', fullPage: false });
  console.log('  Mobile pricing captured');

  console.log('\n=== DONE — All screenshots saved to screenshots/ ===');
  await browser.close();
})();
