#!/usr/bin/env node
/**
 * Batch 7: 50 more connectors — APIs, services, tools
 * Focus: advertising, communication, productivity, data, specialized
 */

const fs = require('fs');
const path = require('path');

const CONNECTORS_DIR = path.join(__dirname, '../packages/core/src/connectors');
const TESTS_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');

const apis = [
  // ── Advertising & Marketing ──
  { id: 'google-ads-api', name: 'Google Ads API', baseUrl: 'https://googleads.googleapis.com/v15', tables: [
    { name: 'campaigns', endpoint: '/customers/{id}/campaigns?pageSize=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'facebook-marketing', name: 'Facebook Marketing', baseUrl: 'https://graph.facebook.com/v19.0', tables: [
    { name: 'campaigns', endpoint: '/act_{id}/campaigns?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'linkedin-ads', name: 'LinkedIn Ads', baseUrl: 'https://api.linkedin.com/v2', tables: [
    { name: 'campaigns', endpoint: '/adCampaignsV2?q=search&start=0&count=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'tiktok-ads', name: 'TikTok Ads', baseUrl: 'https://business-api.tiktok.com/open_api/v1.3', tables: [
    { name: 'campaigns', endpoint: '/campaign/get/?page_size=20', fields: [{n:'campaign_id',t:'string',pk:true},{n:'campaign_name',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'pinterest-ads', name: 'Pinterest Ads', baseUrl: 'https://api.pinterest.com/v5', tables: [
    { name: 'campaigns', endpoint: '/ad_accounts/{id}/campaigns?page_size=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'snapchat-ads', name: 'Snapchat Ads', baseUrl: 'https://adsapi.snapchat.com/v1', tables: [
    { name: 'campaigns', endpoint: '/campaigns', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'string'}] },
  ]},

  // ── Communication ──
  { id: 'twilio-api', name: 'Twilio API', baseUrl: 'https://api.twilio.com/2010-04-01', tables: [
    { name: 'messages', endpoint: '/Accounts/{id}/Messages.json?PageSize=20', fields: [{n:'sid',t:'string',pk:true},{n:'to',t:'string'},{n:'from',t:'string'},{n:'status',t:'string'},{n:'body',t:'string'}] },
    { name: 'calls', endpoint: '/Accounts/{id}/Calls.json?PageSize=20', fields: [{n:'sid',t:'string',pk:true},{n:'to',t:'string'},{n:'from',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'sendgrid-api', name: 'SendGrid API', baseUrl: 'https://api.sendgrid.com/v3', tables: [
    { name: 'messages', endpoint: '/messages?limit=20', fields: [{n:'msg_id',t:'string',pk:true},{n:'from_email',t:'string'},{n:'to_email',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'discord-api', name: 'Discord API', baseUrl: 'https://discord.com/api/v10', tables: [
    { name: 'guilds', endpoint: '/users/@me/guilds', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'owner',t:'boolean'}] },
  ]},
  { id: 'telegram-api', name: 'Telegram Bot API', baseUrl: 'https://api.telegram.org/bot{token}', tables: [
    { name: 'updates', endpoint: '/getUpdates', fields: [{n:'update_id',t:'number',pk:true},{n:'message',t:'json'}] },
  ]},

  // ── Productivity ──
  { id: 'google-sheets-api', name: 'Google Sheets API', baseUrl: 'https://sheets.googleapis.com/v4', tables: [
    { name: 'sheets', endpoint: '/spreadsheets/{id}', fields: [{n:'spreadsheetId',t:'string',pk:true},{n:'title',t:'string'}] },
  ]},
  { id: 'airtable-api', name: 'Airtable API', baseUrl: 'https://api.airtable.com/v0', tables: [
    { name: 'bases', endpoint: '/meta/bases', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'}] },
  ]},
  { id: 'confluence-api', name: 'Confluence API', baseUrl: 'https://{domain}.atlassian.net/wiki/rest/api', tables: [
    { name: 'pages', endpoint: '/content?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'type',t:'string'}] },
  ]},
  { id: 'sharepoint-api', name: 'SharePoint API', baseUrl: 'https://{tenant}.sharepoint.com/_api', tables: [
    { name: 'lists', endpoint: '/web/lists', fields: [{n:'Id',t:'string',pk:true},{n:'Title',t:'string'}] },
  ]},

  // ── E-commerce ──
  { id: 'woocommerce-api', name: 'WooCommerce API', baseUrl: 'https://{store}/wp-json/wc/v3', tables: [
    { name: 'products', endpoint: '/products?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'price',t:'string'},{n:'status',t:'string'}] },
    { name: 'orders', endpoint: '/orders?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'status',t:'string'},{n:'total',t:'string'}] },
  ]},
  { id: 'bigcommerce-api', name: 'BigCommerce API', baseUrl: 'https://api.bigcommerce.com/stores/{store_hash}/v3', tables: [
    { name: 'products', endpoint: '/catalog/products?limit=20', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'price',t:'number'}] },
  ]},
  { id: 'square-api', name: 'Square API', baseUrl: 'https://connect.squareup.com/v2', tables: [
    { name: 'payments', endpoint: '/payments?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'amount_money',t:'json'},{n:'status',t:'string'}] },
  ]},
  { id: 'etsy-api', name: 'Etsy API', baseUrl: 'https://openapi.etsy.com/v3', tables: [
    { name: 'listings', endpoint: '/application/shops/{shop_id}/listings?limit=20', fields: [{n:'listing_id',t:'number',pk:true},{n:'title',t:'string'},{n:'price',t:'number'}] },
  ]},

  // ── Analytics ──
  { id: 'mixpanel-api', name: 'Mixpanel API', baseUrl: 'https://mixpanel.com/api/2.0', tables: [
    { name: 'events', endpoint: '/events?event=["Page View"]&limit=20', fields: [{n:'event',t:'string',pk:true},{n:'properties',t:'json'}] },
  ]},
  { id: 'amplitude-api', name: 'Amplitude API', baseUrl: 'https://amplitude.com/api/2', tables: [
    { name: 'events', endpoint: '/events?limit=20', fields: [{n:'event',t:'string',pk:true},{n:'properties',t:'json'}] },
  ]},
  { id: 'segment-api', name: 'Segment API', baseUrl: 'https://platform.segmentapis.com/v1beta', tables: [
    { name: 'sources', endpoint: '/sources', fields: [{n:'name',t:'string',pk:true},{n:'slug',t:'string'}] },
  ]},

  // ── HR & Recruiting ──
  { id: 'bamboohr-api', name: 'BambooHR API', baseUrl: 'https://api.bamboohr.com/api/gateway.php/{company}', tables: [
    { name: 'employees', endpoint: '/v1/employees/directory', fields: [{n:'id',t:'number',pk:true},{n:'firstName',t:'string'},{n:'lastName',t:'string'},{n:'email',t:'string'}] },
  ]},
  { id: 'greenhouse-api', name: 'Greenhouse API', baseUrl: 'https://harvest.greenhouse.io/v1', tables: [
    { name: 'jobs', endpoint: '/jobs?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'lever-api', name: 'Lever API', baseUrl: 'https://api.lever.co/v1', tables: [
    { name: 'postings', endpoint: '/postings?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'text',t:'string'},{n:'state',t:'string'}] },
  ]},

  // ── Support ──
  { id: 'intercom-api', name: 'Intercom API v2', baseUrl: 'https://api.intercom.io', tables: [
    { name: 'contacts', endpoint: '/contacts?per_page=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'email',t:'string'}] },
    { name: 'conversations', endpoint: '/conversations?per_page=20', fields: [{n:'id',t:'string',pk:true},{n:'created_at',t:'number'},{n:'state',t:'string'}] },
  ]},
  { id: 'freshdesk-api', name: 'Freshdesk API v2', baseUrl: 'https://{domain}.freshdesk.com/api/v2', tables: [
    { name: 'tickets', endpoint: '/tickets?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'subject',t:'string'},{n:'status',t:'number'},{n:'priority',t:'number'}] },
  ]},
  { id: 'zendesk-api', name: 'Zendesk API v2', baseUrl: 'https://{subdomain}.zendesk.com/api/v2', tables: [
    { name: 'tickets', endpoint: '/tickets.json?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'subject',t:'string'},{n:'status',t:'string'}] },
  ]},

  // ── Project Management ──
  { id: 'asana-api', name: 'Asana API', baseUrl: 'https://app.asana.com/api/1.0', tables: [
    { name: 'projects', endpoint: '/projects?limit=20', fields: [{n:'gid',t:'string',pk:true},{n:'name',t:'string'}] },
    { name: 'tasks', endpoint: '/tasks?limit=20', fields: [{n:'gid',t:'string',pk:true},{n:'name',t:'string'},{n:'completed',t:'boolean'}] },
  ]},
  { id: 'monday-api', name: 'Monday.com API', baseUrl: 'https://api.monday.com/v2', tables: [
    { name: 'boards', endpoint: '', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'}] },
  ]},
  { id: 'trello-api', name: 'Trello API', baseUrl: 'https://api.trello.com/1', tables: [
    { name: 'boards', endpoint: '/members/me/boards?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'closed',t:'boolean'}] },
  ]},
  { id: 'clickup-api', name: 'ClickUp API', baseUrl: 'https://api.clickup.com/api/v2', tables: [
    { name: 'tasks', endpoint: '/list/{id}/task?subtasks=true&limit=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'status',t:'json'}] },
  ]},

  // ── Finance & Accounting ──
  { id: 'quickbooks-api', name: 'QuickBooks API', baseUrl: 'https://quickbooks.api.intuit.com/v3', tables: [
    { name: 'customers', endpoint: '/company/{id}/query?query=SELECT * FROM Customer MAXRESULTS 20', fields: [{n:'Id',t:'string',pk:true},{n:'DisplayName',t:'string'}] },
  ]},
  { id: 'xero-api', name: 'Xero API', baseUrl: 'https://api.xero.com/api.xro/2.0', tables: [
    { name: 'invoices', endpoint: '/Invoices?pageSize=20', fields: [{n:'InvoiceID',t:'string',pk:true},{n:'Type',t:'string'},{n:'Status',t:'string'},{n:'Total',t:'number'}] },
  ]},
  { id: 'stripe-billing', name: 'Stripe Billing', baseUrl: 'https://api.stripe.com/v1', tables: [
    { name: 'subscriptions', endpoint: '/subscriptions?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'status',t:'string'},{n:'current_period_end',t:'number'}] },
    { name: 'invoices', endpoint: '/invoices?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'amount_due',t:'number'},{n:'status',t:'string'}] },
  ]},

  // ── DevOps & CI/CD ──
  { id: 'github-actions', name: 'GitHub Actions', baseUrl: 'https://api.github.com', tables: [
    { name: 'workflows', endpoint: '/repos/{owner}/{repo}/actions/workflows', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'state',t:'string'}] },
    { name: 'runs', endpoint: '/repos/{owner}/{repo}/actions/runs?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'status',t:'string'},{n:'conclusion',t:'string'}] },
  ]},
  { id: 'circleci-api', name: 'CircleCI API', baseUrl: 'https://circleci.com/api/v2', tables: [
    { name: 'pipelines', endpoint: '/project/{slug}/pipeline?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'state',t:'string'},{n:'created_at',t:'string'}] },
  ]},
  { id: 'gitlab-ci', name: 'GitLab CI', baseUrl: 'https://gitlab.com/api/v4', tables: [
    { name: 'pipelines', endpoint: '/projects/{id}/pipelines?per_page=20', fields: [{n:'id',t:'number',pk:true},{n:'status',t:'string'},{n:'ref',t:'string'}] },
  ]},

  // ── Monitoring ──
  { id: 'datadog-api', name: 'Datadog API', baseUrl: 'https://api.datadoghq.com/api/v1', tables: [
    { name: 'monitors', endpoint: '/monitor', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'newrelic-api', name: 'New Relic API', baseUrl: 'https://api.newrelic.com/v2', tables: [
    { name: 'applications', endpoint: '/applications.json', fields: [{n:'id',t:'number',pk:true},{n:'name',t:'string'},{n:'health_status',t:'string'}] },
  ]},
  { id: 'pagerduty-api', name: 'PagerDuty API', baseUrl: 'https://api.pagerduty.com', tables: [
    { name: 'incidents', endpoint: '/incidents?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'status',t:'string'}] },
  ]},
  { id: 'sentry-api', name: 'Sentry API', baseUrl: 'https://sentry.io/api/0', tables: [
    { name: 'issues', endpoint: '/organizations/{org}/issues/?query=is:unresolved&limit=20', fields: [{n:'id',t:'string',pk:true},{n:'title',t:'string'},{n:'level',t:'string'}] },
  ]},

  // ── Storage & Files ──
  { id: 'google-drive-api', name: 'Google Drive API', baseUrl: 'https://www.googleapis.com/drive/v3', tables: [
    { name: 'files', endpoint: '/files?pageSize=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'mimeType',t:'string'}] },
  ]},
  { id: 'dropbox-api', name: 'Dropbox API', baseUrl: 'https://api.dropboxapi.com/2', tables: [
    { name: 'files', endpoint: '/files/list_folder', fields: [{n:'name',t:'string',pk:true},{n:'path_display',t:'string'},{n:'size',t:'number'}] },
  ]},
  { id: 'box-api', name: 'Box API', baseUrl: 'https://api.box.com/2.0', tables: [
    { name: 'files', endpoint: '/folders/0/items?limit=20', fields: [{n:'id',t:'string',pk:true},{n:'name',t:'string'},{n:'type',t:'string'}] },
  ]},

  // ── Social ──
  { id: 'twitter-api', name: 'Twitter/X API', baseUrl: 'https://api.twitter.com/2', tables: [
    { name: 'tweets', endpoint: '/tweets/search/recent?max_results=20', fields: [{n:'id',t:'string',pk:true},{n:'text',t:'string'},{n:'created_at',t:'string'}] },
  ]},
  { id: 'mastodon-api', name: 'Mastodon API', baseUrl: 'https://mastodon.social/api/v1', tables: [
    { name: 'trending', endpoint: '/trends?limit=20', fields: [{n:'name',t:'string',pk:true},{n:'url',t:'string'}] },
  ]},
  { id: 'reddit-api', name: 'Reddit API v2', baseUrl: 'https://oauth.reddit.com', tables: [
    { name: 'subreddits', endpoint: '/subreddits/popular?limit=20', fields: [{n:'display_name',t:'string',pk:true},{n:'subscribers',t:'number'},{n:'public_description',t:'string'}] },
  ]},
];

function pascalCase(str) { return str.replace(/(^|-)(\w)/g, (_, _p, c) => c.toUpperCase()); }

function generateConnector(api) {
  const className = pascalCase(api.id) + 'Connector';
  const tablesConst = api.tables.map(t => {
    const cols = t.fields.map(f => `{ name: '${f.n}', type: '${f.t}', nullable: false, primaryKey: ${f.pk || false} }`).join(', ');
    return `{ name: '${t.name}', endpoint: '${t.endpoint}', schema: { name: '${t.name}', table: '${t.name}', columns: [${cols}], primaryKey: ['${t.fields.find(f => f.pk)?.n || t.fields[0].n}'] }, idField: '${t.fields.find(f => f.pk)?.n || t.fields[0].n}' }`;
  }).join(',\n');

  return `// ${api.name} — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
${tablesConst}
];

@registerSource('${api.id}')
export class ${className} extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, '${api.id}', '${api.id}', config, {
      baseUrl: config.host || '${api.baseUrl}',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '${api.tables[0].endpoint.split('?')[0]}',
    });
  }
}
`;
}

function generateTest(api) {
  const tables = api.tables.map(t => `'${t.name}'`).join(', ');
  return `// ${api.name} — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/${api.id}';

const config: ConnectorTestConfig = {
  connectorId: 'test-${api.id}',
  connectorType: 'source',
  engine: '${api.id}',
  config: { host: '${api.baseUrl}' },
  testTables: [${tables}],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
`;
}

let created = 0, skipped = 0;
for (const api of apis) {
  const cp = path.join(CONNECTORS_DIR, `${api.id}.ts`);
  const tp = path.join(TESTS_DIR, `${api.id}.test.ts`);
  if (fs.existsSync(cp)) { skipped++; continue; }
  fs.writeFileSync(cp, generateConnector(api));
  fs.writeFileSync(tp, generateTest(api));
  created++;
}
console.log(`Created: ${created}, Skipped: ${skipped}, Total: ${apis.length}`);
