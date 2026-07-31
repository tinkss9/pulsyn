#!/usr/bin/env node
/**
 * Pulsyn — Guided API Key Wizard
 * Opens browser to each service's API key page, guides user through generation
 * 
 * Usage: node scripts/api-key-wizard.js
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
    signupUrl: 'https://dashboard.stripe.com/register',
    keyUrl: 'https://dashboard.stripe.com/test/apikeys',
    instructions: [
      '1. Sign up at stripe.com (free, no credit card)',
      '2. Go to Developers → API keys',
      '3. Click "Reveal test key" next to Secret key',
      '4. Copy the sk_test_... key',
    ],
    keyPattern: /^sk_test_/,
    testEndpoints: ['Balance', 'Customers', 'Products'],
  },
  {
    name: 'github',
    displayName: 'GitHub',
    signupUrl: 'https://github.com/signup',
    keyUrl: 'https://github.com/settings/tokens/new',
    instructions: [
      '1. Sign up at github.com (free)',
      '2. Go to Settings → Developer settings → Personal access tokens',
      '3. Click "Generate new token (classic)"',
      '4. Select scopes: repo, read:org, user',
      '5. Copy the ghp_... token',
    ],
    keyPattern: /^ghp_/,
    testEndpoints: ['User', 'Repos'],
  },
  {
    name: 'notion',
    displayName: 'Notion',
    signupUrl: 'https://www.notion.so/signup',
    keyUrl: 'https://www.notion.so/my-integrations',
    instructions: [
      '1. Sign up at notion.so (free)',
      '2. Go to Settings & members → My integrations',
      '3. Click "New integration"',
      '4. Name it "Pulsyn CDC"',
      '5. Copy the "Internal Integration Secret"',
    ],
    keyPattern: /^secret_/,
    testEndpoints: ['Search', 'Users'],
  },
  {
    name: 'linear',
    displayName: 'Linear',
    signupUrl: 'https://linear.app/signup',
    keyUrl: 'https://linear.app/settings/api',
    instructions: [
      '1. Sign up at linear.app (free)',
      '2. Go to Settings → API',
      '3. Click "Create key"',
      '4. Name it "Pulsyn CDC"',
      '5. Copy the lin_api_... key',
    ],
    keyPattern: /^lin_api_/,
    testEndpoints: ['Viewer', 'Teams'],
  },
  {
    name: 'airtable',
    displayName: 'Airtable',
    signupUrl: 'https://airtable.com/signup',
    keyUrl: 'https://airtable.com/create/tokens',
    instructions: [
      '1. Sign up at airtable.com (free)',
      '2. Go to Account → Personal access tokens',
      '3. Click "Create new token"',
      '4. Name it "Pulsyn CDC"',
      '5. Add scopes: data.records:read, schema.bases:read',
      '6. Copy the pat... token',
    ],
    keyPattern: /^pat/,
    testEndpoints: ['Bases'],
  },
  {
    name: 'slack',
    displayName: 'Slack',
    signupUrl: 'https://slack.com/signin',
    keyUrl: 'https://api.slack.com/apps',
    instructions: [
      '1. Go to api.slack.com/apps',
      '2. Click "Create New App" → "From scratch"',
      '3. Name it "Pulsyn CDC"',
      '4. Go to "OAuth & Permissions"',
      '5. Add Bot Token Scopes: channels:read, users:read',
      '6. Click "Install to Workspace"',
      '7. Copy the "Bot User OAuth Token" (xoxb-...)',
    ],
    keyPattern: /^xoxb-/,
    testEndpoints: ['Auth Test', 'Channels'],
  },
  {
    name: 'hubspot',
    displayName: 'HubSpot',
    signupUrl: 'https://app.hubspot.com/signup',
    keyUrl: 'https://app.hubspot.com/keys',
    instructions: [
      '1. Sign up at hubspot.com (free CRM)',
      '2. Go to Settings → Integrations → API keys',
      '3. Click "Create key"',
      '4. Select scopes: contacts, companies, deals',
      '5. Copy the pat-... access token',
    ],
    keyPattern: /^pat-/,
    testEndpoints: ['Contacts', 'Companies'],
  },
  {
    name: 'sendgrid',
    displayName: 'SendGrid',
    signupUrl: 'https://signup.sendgrid.com/',
    keyUrl: 'https://app.sendgrid.com/settings/api_keys',
    instructions: [
      '1. Sign up at sendgrid.com (free tier: 100 emails/day)',
      '2. Go to Settings → API Keys',
      '3. Click "Create API Key"',
      '4. Select "Full Access"',
      '5. Copy the SG... key',
    ],
    keyPattern: /^SG\./,
    testEndpoints: ['User', 'Templates'],
  },
  {
    name: 'mailchimp',
    displayName: 'Mailchimp',
    signupUrl: 'https://login.mailchimp.com/signup/',
    keyUrl: 'https://admin.mailchimp.com/account/api/',
    instructions: [
      '1. Sign up at mailchimp.com (free tier: 500 contacts)',
      '2. Go to Account → Extras → API keys',
      '3. Click "Create A Key"',
      '4. Copy the ...-us1 API key',
    ],
    keyPattern: /^[a-z0-9]+-us[0-9]+$/,
    testEndpoints: ['Ping', 'Lists'],
  },
  {
    name: 'jira',
    displayName: 'Jira',
    signupUrl: 'https://www.atlassian.com/software/jira/free',
    keyUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens',
    instructions: [
      '1. Sign up at atlassian.com (free tier)',
      '2. Go to Account → Security → API tokens',
      '3. Click "Create API token"',
      '4. Name it "Pulsyn CDC"',
      '5. Copy the token',
    ],
    keyPattern: /^[A-Za-z0-9+/=]+$/,
    testEndpoints: ['Myself', 'Projects'],
    extraNote: 'Also need your Jira instance URL (e.g., https://yourcompany.atlassian.net)',
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

// Main wizard
async function main() {
  console.log('═'.repeat(60));
  console.log('  PULSYN — API KEY WIZARD');
  console.log('═'.repeat(60));
  console.log('');
  console.log('This wizard helps you generate API keys for 10 popular');
  console.log('SaaS connectors. All have free tiers.');
  console.log('');
  console.log('For each service, I will:');
  console.log('  1. Open the signup/key page in your browser');
  console.log('  2. Guide you through the steps');
  console.log('  3. Capture the API key when you paste it');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const existingKeys = loadKeys();
  const keys = { ...existingKeys };

  // Show current keys
  const savedConnectors = Object.keys(keys);
  if (savedConnectors.length > 0) {
    console.log('Already configured:');
    savedConnectors.forEach(c => console.log(`  ✅ ${c}`));
    console.log('');
  }

  // Filter to services that need keys
  const needsKeys = SERVICES.filter(s => !keys[s.name]);

  if (needsKeys.length === 0) {
    console.log('✅ All connectors already configured!');
    rl.close();
    return;
  }

  console.log(`Need to configure: ${needsKeys.length} connectors`);
  console.log('');
  console.log('─'.repeat(60));

  const startAnswer = await ask(rl, 'Ready to start? (y/n): ');
  if (startAnswer.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    rl.close();
    return;
  }

  // Launch browser
  console.log('\nLaunching browser...');
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
    console.log('\n' + '═'.repeat(60));
    console.log(`  ${service.displayName.toUpperCase()}`);
    console.log('═'.repeat(60));
    console.log('');

    // Show instructions
    console.log('Steps:');
    service.instructions.forEach(step => console.log(`  ${step}`));
    console.log('');

    // Ask if user wants to configure this service
    const configureAnswer = await ask(rl, `Configure ${service.displayName}? (y/n/skip all): `);
    
    if (configureAnswer.toLowerCase() === 'skip all') {
      console.log('Skipping remaining services...');
      break;
    }
    
    if (configureAnswer.toLowerCase() !== 'y') {
      console.log(`⏭️  ${service.displayName} skipped`);
      continue;
    }

    // Open the key page
    console.log(`\nOpening ${service.keyUrl}...`);
    await page.goto(service.keyUrl, { waitUntil: 'domcontentloaded' });

    // Wait for user to generate and copy the key
    console.log('\n📋 Generate the API key in the browser, then copy it.');
    console.log('   Press Enter here when you have the key copied...');

    await ask(rl, '');

    // Ask for the key
    const key = await ask(rl, 'Paste the API key here: ');

    if (key && key.trim()) {
      const trimmedKey = key.trim();
      
      // Validate key format
      if (service.keyPattern && !service.keyPattern.test(trimmedKey)) {
        console.log(`⚠️  Key format doesn't match expected pattern for ${service.displayName}`);
        const forceAnswer = await ask(rl, 'Save anyway? (y/n): ');
        if (forceAnswer.toLowerCase() !== 'y') {
          console.log(`⏭️  ${service.displayName} skipped`);
          continue;
        }
      }

      keys[service.name] = trimmedKey;
      saveKeys(keys);
      console.log(`✅ ${service.displayName} key saved!`);
    } else {
      console.log(`⏭️  ${service.displayName} skipped`);
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
  console.log('Or verify individual connectors:');
  console.log('  node scripts/verify-saas-connectors.js --connector <name> --api-key <key>');
  console.log('');

  rl.close();
}

main().catch(console.error);
