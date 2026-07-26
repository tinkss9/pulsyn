// Playwright — Desktop + Mobile verification
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Desktop viewport
  console.log('=== DESKTOP VIEWPORT (1440x900) ===\n');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const desktopPages = [
    ['/', 'homepage'],
    ['/demo', 'demo'],
    ['/pricing', 'pricing'],
    ['/login', 'login'],
    ['/signup', 'signup'],
    ['/vs/fivetran', 'vs-fivetran'],
  ];
  
  for (const [path, name] of desktopPages) {
    await desktopPage.goto('https://pulsynai.com' + path, { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({ path: 'screenshots/desktop-' + name + '.png', fullPage: false });
    console.log('Desktop ' + name + ': captured');
  }
  
  // Mobile viewport
  console.log('\n=== MOBILE VIEWPORT (375x812) ===\n');
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  
  const mobilePages = [
    ['/', 'homepage'],
    ['/demo', 'demo'],
    ['/pricing', 'pricing'],
    ['/login', 'login'],
    ['/signup', 'signup'],
  ];
  
  for (const [path, name] of mobilePages) {
    await mobilePage.goto('https://pulsynai.com' + path, { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: 'screenshots/mobile-' + name + '.png', fullPage: false });
    console.log('Mobile ' + name + ': captured');
  }
  
  // Test hamburger menu on mobile
  console.log('\n=== TESTING HAMBURGER MENU ===\n');
  await mobilePage.goto('https://pulsynai.com', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  
  // Find and click hamburger menu
  const menuButton = await mobilePage.$('button');
  if (menuButton) {
    await menuButton.click();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: 'screenshots/mobile-menu-open.png', fullPage: false });
    console.log('Mobile menu open: captured');
    
    // Check if menu items are visible
    const menuText = await mobilePage.textContent('body') || '';
    const hasFeatures = menuText.includes('Features');
    const hasPricing = menuText.includes('Pricing');
    const hasDemo = menuText.includes('Demo');
    console.log('Menu items visible: Features=' + hasFeatures + ', Pricing=' + hasPricing + ', Demo=' + hasDemo);
  } else {
    console.log('No hamburger menu button found');
  }
  
  console.log('\n=== DONE ===');
  await browser.close();
})();
