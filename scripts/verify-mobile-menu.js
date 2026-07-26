// Playwright — Mobile verification of hamburger menu on ALL pages
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });

  console.log('=== MOBILE HAMBURGER MENU VERIFICATION ===\n');

  const pages = [
    ['/', 'homepage'],
    ['/demo', 'demo'],
    ['/pricing', 'pricing'],
    ['/login', 'login'],
    ['/signup', 'signup'],
    ['/vs/fivetran', 'vs-fivetran'],
    ['/vs/airbyte', 'vs-airbyte'],
  ];

  for (const [path, name] of pages) {
    await mobile.goto('https://pulsynai.com' + path, { waitUntil: 'networkidle', timeout: 30000 });
    await mobile.waitForTimeout(2000);
    await mobile.screenshot({ path: 'screenshots/mobile-' + name + '-final.png', fullPage: false });
    
    // Check for hamburger button
    const buttons = await mobile.$$('button');
    let hasHamburger = false;
    for (const btn of buttons) {
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      if (text?.includes('☰') || ariaLabel?.includes('menu') || ariaLabel?.includes('Menu')) {
        hasHamburger = true;
      }
    }
    
    // Also check for Menu icon (Lucide)
    const menuIcon = await mobile.$('svg.lucide-menu');
    if (menuIcon) hasHamburger = true;
    
    console.log(name.padEnd(20) + ': ' + (hasHamburger ? '✅ Hamburger found' : '⚠️ No hamburger'));
  }

  // Test hamburger on homepage
  console.log('\n=== TESTING HAMBURGER INTERACTION ===\n');
  await mobile.goto('https://pulsynai.com', { waitUntil: 'networkidle', timeout: 30000 });
  await mobile.waitForTimeout(2000);
  
  // Find hamburger button
  const menuBtn = await mobile.$('button');
  if (menuBtn) {
    await menuBtn.click();
    await mobile.waitForTimeout(1000);
    await mobile.screenshot({ path: 'screenshots/mobile-menu-open-final.png', fullPage: false });
    
    const bodyText = await mobile.textContent('body') || '';
    console.log('Menu open: Features=' + bodyText.includes('Features') + ', Pricing=' + bodyText.includes('Pricing') + ', Demo=' + bodyText.includes('Demo'));
  }

  console.log('\n=== DONE ===');
  await browser.close();
})();
