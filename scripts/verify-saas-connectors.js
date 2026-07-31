#!/usr/bin/env node
/**
 * Pulsyn — SaaS Connector Verification Script
 * Tests connectors end-to-end with real API keys
 * 
 * Usage: node scripts/verify-saas-connectors.js --connector stripe --api-key sk_test_xxx
 */

const https = require('https');
const http = require('http');

// Connector configurations
const CONNECTORS = {
  stripe: {
    name: 'Stripe',
    baseUrl: 'https://api.stripe.com',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    testEndpoints: [
      { name: 'Balance', path: '/v1/balance', method: 'GET' },
      { name: 'Customers', path: '/v1/customers?limit=3', method: 'GET' },
      { name: 'Charges', path: '/v1/charges?limit=3', method: 'GET' },
      { name: 'Products', path: '/v1/products?limit=3', method: 'GET' },
    ],
  },
  github: {
    name: 'GitHub',
    baseUrl: 'https://api.github.com',
    authHeader: (key) => ({ 'Authorization': `token ${key}`, 'User-Agent': 'Pulsyn-CDC' }),
    testEndpoints: [
      { name: 'User', path: '/user', method: 'GET' },
      { name: 'Repos', path: '/user/repos?per_page=3', method: 'GET' },
      { name: 'Orgs', path: '/user/orgs', method: 'GET' },
    ],
  },
  hubspot: {
    name: 'HubSpot',
    baseUrl: 'https://api.hubapi.com',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    testEndpoints: [
      { name: 'Contacts', path: '/crm/v3/objects/contacts?limit=3', method: 'GET' },
      { name: 'Companies', path: '/crm/v3/objects/companies?limit=3', method: 'GET' },
      { name: 'Deals', path: '/crm/v3/objects/deals?limit=3', method: 'GET' },
    ],
  },
  slack: {
    name: 'Slack',
    baseUrl: 'https://slack.com/api',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    testEndpoints: [
      { name: 'Auth Test', path: '/auth.test', method: 'POST' },
      { name: 'Channels', path: '/conversations.list?limit=3', method: 'GET' },
      { name: 'Users', path: '/users.list?limit=3', method: 'GET' },
    ],
  },
  notion: {
    name: 'Notion',
    baseUrl: 'https://api.notion.com',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}`, 'Notion-Version': '2022-06-28' }),
    testEndpoints: [
      { name: 'Search', path: '/v1/search', method: 'POST', body: {} },
      { name: 'Users', path: '/v1/users', method: 'GET' },
    ],
  },
  linear: {
    name: 'Linear',
    baseUrl: 'https://api.linear.app',
    authHeader: (key) => ({ 'Authorization': `${key}` }),
    testEndpoints: [
      { name: 'Viewer', path: '/graphql', method: 'POST', body: { query: '{ viewer { id name email } }' } },
      { name: 'Teams', path: '/graphql', method: 'POST', body: { query: '{ teams { nodes { id name } } }' } },
    ],
  },
  airtable: {
    name: 'Airtable',
    baseUrl: 'https://api.airtable.com',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    testEndpoints: [
      { name: 'Bases', path: '/v0/meta/bases', method: 'GET' },
    ],
  },
  jira: {
    name: 'Jira',
    baseUrl: null, // Dynamic based on instance
    authHeader: (key, config) => ({ 'Authorization': `Basic ${Buffer.from(`${config.email}:${key}`).toString('base64')}` }),
    testEndpoints: [
      { name: 'Myself', path: '/rest/api/3/myself', method: 'GET' },
      { name: 'Projects', path: '/rest/api/3/project?maxResults=3', method: 'GET' },
    ],
  },
  salesforce: {
    name: 'Salesforce',
    baseUrl: null, // Dynamic based on instance
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    testEndpoints: [
      { name: 'Limits', path: '/services/data/v59.0/limits', method: 'GET' },
      { name: 'Accounts', path: '/services/data/v59.0/query?q=SELECT+Id,Name+FROM+Account+LIMIT+3', method: 'GET' },
    ],
  },
  zendesk: {
    name: 'Zendesk',
    baseUrl: null, // Dynamic based on instance
    authHeader: (key, config) => ({ 'Authorization': `Basic ${Buffer.from(`${config.email}/token:${key}`).toString('base64')}` }),
    testEndpoints: [
      { name: 'Me', path: '/api/v2/users/me.json', method: 'GET' },
      { name: 'Tickets', path: '/api/v2/tickets.json?per_page=3', method: 'GET' },
    ],
  },
  shopify: {
    name: 'Shopify',
    baseUrl: null, // Dynamic based on store
    authHeader: (key) => ({ 'X-Shopify-Access-Token': key }),
    testEndpoints: [
      { name: 'Shop', path: '/admin/api/2024-01/shop.json', method: 'GET' },
      { name: 'Products', path: '/admin/api/2024-01/products.json?limit=3', method: 'GET' },
      { name: 'Orders', path: '/admin/api/2024-01/orders.json?limit=3&status=any', method: 'GET' },
    ],
  },
  mailchimp: {
    name: 'Mailchimp',
    baseUrl: null, // Dynamic based on datacenter
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    testEndpoints: [
      { name: 'Ping', path: '/3.0/ping', method: 'GET' },
      { name: 'Lists', path: '/3.0/lists?count=3', method: 'GET' },
      { name: 'Campaigns', path: '/3.0/campaigns?count=3', method: 'GET' },
    ],
  },
  google_sheets: {
    name: 'Google Sheets',
    baseUrl: 'https://sheets.googleapis.com',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    testEndpoints: [
      { name: 'Spreadsheets', path: '/v4/spreadsheets', method: 'GET' },
    ],
  },
  sendgrid: {
    name: 'SendGrid',
    baseUrl: 'https://api.sendgrid.com',
    authHeader: (key) => ({ 'Authorization': `Bearer ${key}` }),
    testEndpoints: [
      { name: 'User', path: '/v3/user/profile', method: 'GET' },
      { name: 'Templates', path: '/v3/templates?generations=dynamic&page_size=3', method: 'GET' },
    ],
  },
};

// HTTP request helper
function makeRequest(url, method, headers, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const transport = urlObj.protocol === 'https:' ? https : http;
    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Verify a single connector
async function verifyConnector(connectorName, apiKey, config = {}) {
  const connector = CONNECTORS[connectorName];
  if (!connector) {
    console.error(`Unknown connector: ${connectorName}`);
    console.error(`Available: ${Object.keys(CONNECTORS).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  VERIFYING: ${connector.name}`);
  console.log(`${'═'.repeat(60)}\n`);

  const baseUrl = config.baseUrl || connector.baseUrl;
  if (!baseUrl && connectorName === 'jira') {
    console.error('Jira requires --base-url https://your-instance.atlassian.net');
    process.exit(1);
  }
  if (!baseUrl && connectorName === 'salesforce') {
    console.error('Salesforce requires --base-url https://your-instance.salesforce.com');
    process.exit(1);
  }
  if (!baseUrl && connectorName === 'zendesk') {
    console.error('Zendesk requires --base-url https://your-instance.zendesk.com');
    process.exit(1);
  }
  if (!baseUrl && connectorName === 'shopify') {
    console.error('Shopify requires --base-url https://your-store.myshopify.com');
    process.exit(1);
  }
  if (!baseUrl && connectorName === 'mailchimp') {
    console.error('Mailchimp requires --base-url https://us1.api.mailchimp.com (your datacenter)');
    process.exit(1);
  }

  const headers = connector.authHeader(apiKey, { ...config, baseUrl });
  let passed = 0;
  let failed = 0;

  for (const endpoint of connector.testEndpoints) {
    const url = `${baseUrl}${endpoint.path}`;
    process.stdout.write(`  Testing ${endpoint.name.padEnd(20)} `);

    try {
      const start = Date.now();
      const response = await makeRequest(url, endpoint.method, headers, endpoint.body);
      const latency = Date.now() - start;

      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${response.status} (${latency}ms)`);
        passed++;

        // Show sample data
        if (typeof response.data === 'object' && response.data !== null) {
          const keys = Object.keys(response.data).slice(0, 3);
          if (keys.length > 0) {
            console.log(`     Sample: ${keys.join(', ')}`);
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        console.log(`❌ ${response.status} — Authentication failed`);
        failed++;
      } else if (response.status === 429) {
        console.log(`⚠️  ${response.status} — Rate limited (try again later)`);
        passed++; // Rate limiting means auth worked
      } else {
        console.log(`❌ ${response.status} — ${JSON.stringify(response.data).substring(0, 100)}`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  Result: ${passed}/${passed + failed} endpoints passed`);

  return { passed, failed, total: passed + failed };
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
Pulsyn — SaaS Connector Verification

Usage:
  node scripts/verify-saas-connectors.js --connector <name> --api-key <key> [--base-url <url>]

Examples:
  node scripts/verify-saas-connectors.js --connector stripe --api-key sk_test_xxx
  node scripts/verify-saas-connectors.js --connector github --api-key ghp_xxx
  node scripts/verify-saas-connectors.js --connector jira --api-key xxx --base-url https://your.atlassian.net
  node scripts/verify-saas-connectors.js --connector shopify --api-key shpat_xxx --base-url https://store.myshopify.com
  node scripts/verify-saas-connectors.js --connector mailchimp --api-key xxx-us1 --base-url https://us1.api.mailchimp.com

Available connectors:
  ${Object.keys(CONNECTORS).join(', ')}

Quick API key setup:
  Stripe:      https://dashboard.stripe.com/test/apikeys
  GitHub:      https://github.com/settings/tokens
  HubSpot:     https://app.hubspot.com/keys
  Slack:       https://api.slack.com/apps
  Notion:      https://www.notion.so/my-integrations
  Linear:      https://linear.app/settings/api
  Airtable:    https://airtable.com/create/tokens
  Jira:        https://id.atlassian.com/manage-profile/security/api-tokens
  Salesforce:  https://login.salesforce.com (Developer Edition)
  Shopify:     https://partners.shopify.com (Partner dev store)
  Mailchimp:   https://admin.mailchimp.com/account/api/
  SendGrid:    https://app.sendgrid.com/settings/api_keys
`);
    process.exit(0);
  }

  const connectorIdx = args.indexOf('--connector');
  const apiKeyIdx = args.indexOf('--api-key');
  const baseUrlIdx = args.indexOf('--base-url');

  if (connectorIdx === -1 || apiKeyIdx === -1) {
    console.error('Error: --connector and --api-key are required');
    process.exit(1);
  }

  const connectorName = args[connectorIdx + 1];
  const apiKey = args[apiKeyIdx + 1];
  const baseUrl = baseUrlIdx !== -1 ? args[baseUrlIdx + 1] : null;

  console.log('═'.repeat(60));
  console.log('  PULSYN — SAAS CONNECTOR VERIFICATION');
  console.log('═'.repeat(60));

  const result = await verifyConnector(connectorName, apiKey, { baseUrl });

  console.log('\n' + '═'.repeat(60));
  if (result.failed === 0) {
    console.log('  ✅ ALL TESTS PASSED');
  } else {
    console.log(`  ⚠️  ${result.failed} TESTS FAILED`);
  }
  console.log('═'.repeat(60));
}

main().catch(console.error);
