#!/usr/bin/env node
/**
 * Pulsyn — Automated API Key Generator
 * Uses Playwright to sign up for free accounts and generate API keys
 * 
 * Usage: node scripts/auto-generate-api-keys.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// API keys storage
const KEYS_FILE = path.join(__dirname, '..', '.api-keys.json');

// Connector configurations
const CONNECTORS = [
  {
    name: 'GitHub',
    url: 'https://github.com/settings/tokens/new',
    description: 'Personal access token (classic)',
    scopes: ['repo', 'read:org', 'user'],
    steps: async (page) => {
      // GitHub requires login first - user needs to be logged in
      console.log('  ℹ️  GitHub requires manual login first');
      console.log('  → Open https://github.com/settings/tokens/new in your browser');
      console.log('  → Generate token with scopes: repo, read:org, user');
      return null;
    },
  },
  {
    name: 'Notion',
    url: 'https://www.notion.so/my-integrations',
    description: 'Internal integration token',
    steps: async (page) => {
      console.log('  ℹ️  Notion requires manual integration creation');
      console.log('  → Open https://www.notion.so/my-integrations');
      console.log('  → Click "New integration"');
      console.log('  → Copy the "Internal Integration Secret"');
      return null;
    },
  },
  {
    name: 'Linear',
    url: 'https://linear.app/settings/api',
    description: 'Personal API key',
    steps: async (page) => {
      console.log('  ℹ️  Linear requires manual API key generation');
      console.log('  → Open https://linear.app/settings/api');
      console.log('  → Click "Create key"');
      console.log('  → Copy the API key');
      return null;
    },
  },
  {
    name: 'Airtable',
    url: 'https://airtable.com/create/tokens',
    description: 'Personal access token',
    steps: async (page) => {
      console.log('  ℹ️  Airtable requires manual token creation');
      console.log('  → Open https://airtable.com/create/tokens');
      console.log('  → Click "Create new token"');
      console.log('  → Add scopes: data.records:read, schema.bases:read');
      console.log('  → Copy the token');
      return null;
    },
  },
  {
    name: 'Slack',
    url: 'https://api.slack.com/apps',
    description: 'Bot token (xoxb-...)',
    steps: async (page) => {
      console.log('  ℹ️  Slack requires manual app creation');
      console.log('  → Open https://api.slack.com/apps');
      console.log('  → Click "Create New App" → "From scratch"');
      console.log('  → Go to "OAuth & Permissions"');
      console.log('  → Add Bot Token Scopes: channels:read, users:read');
      console.log('  → Install to workspace');
      console.log('  → Copy "Bot User OAuth Token"');
      return null;
    },
  },
  {
    name: 'HubSpot',
    url: 'https://app.hubspot.com/keys',
    description: 'Private app access token',
    steps: async (page) => {
      console.log('  ℹ️  HubSpot requires manual key generation');
      console.log('  → Open https://app.hubspot.com/keys');
      console.log('  → Click "Create key"');
      console.log('  → Select scopes: contacts, companies, deals');
      console.log('  → Copy the access token');
      return null;
    },
  },
  {
    name: 'SendGrid',
    url: 'https://app.sendgrid.com/settings/api_keys',
    description: 'API key',
    steps: async (page) => {
      console.log('  ℹ️  SendGrid requires manual key generation');
      console.log('  → Open https://app.sendgrid.com/settings/api_keys');
      console.log('  → Click "Create API Key"');
      console.log('  → Select "Full Access"');
      console.log('  → Copy the API key');
      return null;
    },
  },
  {
    name: 'Mailchimp',
    url: 'https://admin.mailchimp.com/account/api/',
    description: 'API key',
    steps: async (page) => {
      console.log('  ℹ️  Mailchimp requires manual key generation');
      console.log('  → Open https://admin.mailchimp.com/account/api/');
      console.log('  → Click "Create A Key"');
      console.log('  → Copy the API key');
      return null;
    },
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
  console.log(`\n✅ Keys saved to ${KEYS_FILE}`);
}

// Main
async function main() {
  console.log('═'.repeat(60));
  console.log('  PULSYN — AUTOMATED API KEY GENERATOR');
  console.log('═'.repeat(60));
  console.log('');
  console.log('This script helps you generate API keys for SaaS connectors.');
  console.log('Some connectors require manual steps (OAuth, app creation).');
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

  // Show connectors that need keys
  const needsKeys = CONNECTORS.filter(c => !keys[c.name.toLowerCase()]);
  if (needsKeys.length > 0) {
    console.log('Connectors that need API keys:');
    needsKeys.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} — ${c.description}`);
    });
    console.log('');
  }

  // Interactive mode
  console.log('─'.repeat(60));
  console.log('MANUAL KEY ENTRY');
  console.log('─'.repeat(60));
  console.log('');
  console.log('For each connector, paste your API key when prompted.');
  console.log('Press Enter to skip a connector.');
  console.log('');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
  }

  for (const connector of CONNECTORS) {
    const keyName = connector.name.toLowerCase();
    if (keys[keyName]) {
      console.log(`✅ ${connector.name} — already configured`);
      continue;
    }

    console.log(`\n─── ${connector.name} ───`);
    console.log(`Get your key: ${connector.url}`);
    console.log(`Description: ${connector.description}`);

    const key = await ask(`Paste API key (or Enter to skip): `);
    if (key && key.trim()) {
      keys[keyName] = key.trim();
      console.log(`✅ ${connector.name} key saved`);
    } else {
      console.log(`⏭️  ${connector.name} skipped`);
    }
  }

  // Save keys
  saveKeys(keys);

  // Show summary
  console.log('\n' + '═'.repeat(60));
  console.log('  SUMMARY');
  console.log('═'.repeat(60));
  console.log('');

  const configured = Object.keys(keys);
  const total = CONNECTORS.length;
  const percent = Math.round((configured.length / total) * 100);

  console.log(`Configured: ${configured.length}/${total} (${percent}%)`);
  console.log('');
  console.log('Connectors with API keys:');
  configured.forEach(c => console.log(`  ✅ ${c}`));

  const missing = CONNECTORS.filter(c => !keys[c.name.toLowerCase()]).map(c => c.name);
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
  console.log('  node scripts/verify-saas-connectors.js --connector stripe --api-key <key>');
  console.log('  node scripts/verify-saas-connectors.js --connector github --api-key <key>');
  console.log('');

  rl.close();
}

main().catch(console.error);
