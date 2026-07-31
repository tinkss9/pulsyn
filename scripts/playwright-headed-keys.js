#!/usr/bin/env node
/**
 * Pulsyn — Playwright Headed API Key Capture
 * Opens visible browser, navigates to API key pages, waits for user to generate keys
 * 
 * Usage: node scripts/playwright-headed-keys.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const KEYS_FILE = path.join(__dirname, '..', '.api-keys.json');

// Services to configure
const SERVICES = [
  {
    name: 'stripe',
    displayName: 'Stripe',
    url: 'https://dashboard.stripe.com/test/apikeys',
    keyPattern: /^sk_test_/,
  },
  {
    name: 'github',
    displayName: 'GitHub',
    url: 'https://github.com/settings/tokens/new',
    keyPattern: /^ghp_/,
  },
  {
    name: 'notion',
    displayName: 'Notion',
    url: 'https://www.notion.so/my-integrations',
    keyPattern: /^secret_/,
  },
  {
    name: 'linear',
    displayName: 'Linear',
    url: 'https://linear.app/settings/api',
    keyPattern: /^lin_api_/,
  },
  {
    name: 'airtable',
    displayName: 'Airtable',
    url: 'https://airtable.com/create/tokens',
    keyPattern: /^pat/,
  },
];

// Load existing keys
function loadKeys() {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

// Save keys
function saveKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

// Ask question
function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// Main
async function main() {
  console.log('═'.repeat(60));
  console.log('  PULSYN — PLAYWRIGHT HEADED API KEY CAPTURE');
  console.log('═'.repeat(60));
  console.log('');
  console.log('This script opens a visible browser to each service.');
  console.log('Generate the API key, copy it, and paste it here.');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const existingKeys = loadKeys();
  const keys = { ...existingKeys };

  // Filter to services that need keys
  const needsKeys = SERVICES.filter(s => !keys[s.name]);

  if (needsKeys.length === 0) {
    console.log('✅ All connectors already configured!');
    rl.close();
    return;
  }

  console.log(`Need to configure: ${needsKeys.length} connectors`);
  console.log('');

  // Launch browser in headed mode
  console.log('Launching browser (headed mode)...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null,
  });

  const page = await context.newPage();

  // Process each service
  for (const service of needsKeys) {
    console.log('\n' + '─'.repeat(60));
    console.log(`  ${service.displayName.toUpperCase()}`);
    console.log('─'.repeat(60));
    console.log('');
    console.log(`Opening ${service.url}...`);

    // Navigate to API key page
    await page.goto(service.url, { waitUntil: 'domcontentloaded' });

    console.log('');
    console.log('📋 In the browser:');
    console.log('   1. Log in or sign up if needed');
    console.log('   2. Generate an API key');
    console.log('   3. Copy the key');
    console.log('');
    console.log('   Press Enter here when you have the key copied...');

    await ask(rl, '');

    // Try to read from clipboard
    let key = '';
    try {
      const clipboardy = await import('clipboardy');
      const clipboard = clipboardy.default.readSync();
      if (service.keyPattern.test(clipboard)) {
        key = clipboard;
        console.log(`  ✅ Captured from clipboard: ${key.substring(0, 10)}...`);
      }
    } catch {}

    if (!key) {
      key = await ask(rl, '  Paste the API key here: ');
    }

    if (key && key.trim()) {
      keys[service.name] = key.trim();
      saveKeys(keys);
      console.log(`  ✅ ${service.displayName} key saved!`);
    } else {
      console.log(`  ⏭️  ${service.displayName} skipped`);
    }
  }

  // Close browser
  await browser.close();

  // Show summary
  console.log('\n' + '═'.repeat(60));
  console.log('  SUMMARY');
  console.log('═'.repeat(60));
  console.log('');

  const configured = Object.keys(keys);
  console.log(`Configured: ${configured.length}/${SERVICES.length}`);
  configured.forEach(c => console.log(`  ✅ ${c}`));

  console.log('');
  console.log('Run verification:');
  console.log('  node scripts/verify-all-connectors.js');
  console.log('');

  rl.close();
}

main().catch(console.error);
