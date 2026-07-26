// Headed Playwright — Check actual page rendering
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const pages = ['/', '/pricing', '/demo', '/login', '/signup', '/vs/fivetran', '/vs/airbyte', '/vs/confluent', '/vs/debezium'];
  
  for (const p of pages) {
    console.log(`\n=== Testing: ${p} ===`);
    await page.goto('https://pulsynai.com' + p, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Get all text content
    const bodyText = await page.textContent('body');
    const textLength = bodyText ? bodyText.trim().length : 0;
    
    // Get H1
    const h1 = await page.$eval('h1', el => el.textContent).catch(() => 'NO H1');
    
    // Get all visible text elements
    const visibleTexts = await page.$$eval('h1, h2, h3, p, span, a, button', els => 
      els.filter(el => el.offsetHeight > 0 && el.textContent.trim().length > 0)
         .map(el => el.textContent.trim().substring(0, 80))
         .slice(0, 20)
    );
    
    console.log(`  Body text length: ${textLength}`);
    console.log(`  H1: ${h1}`);
    console.log(`  Visible elements: ${visibleTexts.length}`);
    if (visibleTexts.length > 0) {
      console.log('  First 10 visible texts:');
      visibleTexts.slice(0, 10).forEach((t, i) => console.log(`    ${i+1}. ${t}`));
    } else {
      console.log('  ⚠️ NO VISIBLE TEXT FOUND');
    }
    
    // Check for errors
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    
    await page.screenshot({ path: `screenshots/headed-${p.replace(/\//g, '-').replace(/^-/, '')}.png` });
    
    if (errors.length > 0) {
      console.log(`  Errors: ${errors.join(', ')}`);
    }
  }
  
  console.log('\n=== DONE ===');
  await browser.close();
})();
