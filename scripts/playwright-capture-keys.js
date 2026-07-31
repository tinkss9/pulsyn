#!/usr/bin/env node
/**
 * Pulsyn — Playwright API Key Capture
 * Opens browser to each service's API key page, waits for user to generate key, captures it
 * 
 * Usage: node scripts/playwright-capture-keys.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const KEYS_FILE = path.join(__dirname, '..', '.api-keys.json');

// Services with their API key pages
const SERVICES = [
  {
    name: 'stripe',
    displayName: 'Stripe',
    url: 'https://dashboard.stripe.com/test/apikeys',
    instructions: 'Click "Reveal test key" next to Secret key, then copy the sk_test_... key',
    keyPattern: /sk_test_[a-zA-Z0-9_]+/,
    keyName: 'secret_key',
  },
  {
    name: 'github',
    displayName: 'GitHub',
    url: 'https://github.com/settings/tokens/new',
    instructions: 'Enter a note, select scopes (repo, read:org), click "Generate token", copy the ghp_... token',
    keyPattern: /ghp_[a-zA-Z0-9]+/,
    keyName: 'token',
  },
  {
    name: 'notion',
    displayName: 'Notion',
    url: 'https://www.notion.so/my-integrations',
    instructions: 'Click "New integration", name it "Pulsyn", copy the "Internal Integration Secret"',
    keyPattern: /secret_[a-zA-Z0-9]+/,
    keyName: 'integration_token',
  },
  {
    name: 'linear',
    displayName: 'Linear',
    url: 'https://linear.app/settings/api',
    instructions: 'Click "Create key", name it "Pulsyn", copy the API key',
    keyPattern: /lin_api_[a-zA-Z0-9]+/,
    keyName: 'api_key',
  },
  {
    name: 'airtable',
    displayName: 'Airtable',
    url: 'https://airtable.com/create/tokens',
    instructions: 'Click "Create new token", add scopes (data.records:read, schema.bases:read), copy the token',
    keyPattern: /pat[a-zA-Z0-9]+\.[a-f0-9]+/,
    keyName: 'personal_access_token',
  },
  {
    name: 'slack',
    displayName: 'Slack',
    url: 'https://api.slack.com/apps',
    instructions: 'Create app → OAuth & Permissions → Add Bot Scopes → Install → Copy Bot Token',
    keyPattern: /xoxb-[0-9]+-[a-zA-Z0-9]+/,
    keyName: 'bot_token',
  },
  {
    name: 'hubspot',
    displayName: 'HubSpot',
    url: 'https://app.hubspot.com/keys',
    instructions: 'Click "Create key", select scopes, copy the access token',
    keyPattern: /pat-[a-z]{4}-[a-z0-9-]+/,
    keyName: 'access_token',
  },
  {
    name: 'sendgrid',
    displayName: 'SendGrid',
    url: 'https://app.sendgrid.com/settings/api_keys',
    instructions: 'Click "Create API Key", select "Full Access", copy the key',
    keyPattern: /SG\.[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+/,
    keyName: 'api_key',
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

// Capture key from clipboard or page
async function captureKey(page, service) {
  console.log(`\n  📋 Waiting for you to generate the ${service.displayName} API key...`);
  console.log(`  ${service.instructions}`);
  console.log(`  Press Enter here when you've copied the key...`);

  // Wait for user to press Enter
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  return new Promise((resolve) => {
    rl.question('', async () => {
      rl.close();
      
      // Try to read from clipboard
      try {
        const clipboardy = await import('clipboardy');
        const clipboard = clipboardy.default.readSync();
        
        if (service.keyPattern.test(clipboard)) {
          console.log(`  ✅ Captured key from clipboard!`);
          resolve(clipboard);
          return;
        }
      } catch (e) {
        // clipboardy not available, ask user to paste
      }
      
      // Ask user to paste
      const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl2.question(`  Paste the API key here: `, (key) => {
        rl2.close();
        resolve(key.trim());
      });
    });
  });
}

// Main
async function main() {
  console.log('═'.repeat(60));
  console.log('  PULSYN — PLAYWRIGHT API KEY CAPTURE');
  console.log('═'.repeat(60));
  console.log('');
  console.log('This script opens your browser to each service\'s API key page.');
  console.log('Generate the key, copy it, and paste it here.');
  console.log('');

  const existingKeys = loadKeys();
  const keys = { ...existingKeys };

  // Show current keys
  const savedConnectors = Object.keys(keys);
  if (savedConnectors.length > 0) {
    console.log('Already configured:');
    savedConnectors.forEach(c => console.log(`  ✅ ${c}`));
    console.log('');
  }

  // Filter to only services that need keys
  const needsKeys = SERVICES.filter(s => !keys[s.name]);
  
  if (needsKeys.length === 0) {
    console.log('✅ All connectors already configured!');
    console.log('');
    console.log('Run verification:');
    console.log('  node scripts/verify-all-connectors.js');
    return;
  }

  console.log(`Need to configure: ${needsKeys.length} connectors`);
  console.log('');

  // Launch browser
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null, // Use full window
  });

  const page = await context.newPage();

  // Process each service
  for (const service of needsKeys) {
    console.log('\n' + '─'.repeat(60));
    console.log(`  ${service.displayName.toUpperCase()}`);
    console.log('─'.repeat(60));

    // Navigate to API key page
    console.log(`  Opening ${service.url}...`);
    await page.goto(service.url, { waitUntil: 'domcontentloaded' });

    // Wait for user to complete the process
    const key = await captureKey(page, service);

    if (key) {
      keys[service.name] = key;
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
  console.log('');
  configured.forEach(c => console.log(`  ✅ ${c}`));

  const missing = SERVICES.filter(s => !keys[s.name]).map(s => s.name);
  if (missing.length > 0) {
    console.log('');
    console.log('Still need keys:');
    missing.forEach(c => console.log(`  ❌ ${c}`));
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log('NEXT STEPS');
  console.log('─'.repeat(60));
  console.log('');
  console.log('Run verification:');
  console.log('  node scripts/verify-all-connectors.js');
  console.log('');
}

main().catch(console.error);
