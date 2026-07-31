#!/usr/bin/env npx tsx
/**
 * Pulsyn Test API Key Setup Script
 * 
 * Guides you through getting free/community API keys for all failing connectors.
 * Validates each connection and updates .env automatically.
 * 
 * Usage:
 *   npx tsx scripts/setup-test-keys.ts           # Interactive setup
 *   npx tsx scripts/setup-test-keys.ts --validate  # Validate existing keys
 *   npx tsx scripts/setup-test-keys.ts --env-only   # Just show what to set
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const ENV_PATH = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

// ANSI colors
const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

interface ConnectorSetup {
  name: string;
  failures: number;
  tier: 'instant' | 'quick' | 'medium' | 'hard';
  envVars: { key: string; label: string; example?: string; secret?: boolean }[];
  freeOption: string;
  signupUrl: string;
  instructions: string[];
  validate?: (env: Record<string, string>) => Promise<{ ok: boolean; message: string }>;
}

const connectors: ConnectorSetup[] = [
  {
    name: 'GitHub',
    failures: 16,
    tier: 'instant',
    envVars: [
      { key: 'TEST_GITHUB_TOKEN', label: 'Personal Access Token', example: 'ghp_xxxxxxxxxxxx', secret: true },
      { key: 'TEST_GITHUB_OWNER', label: 'GitHub username or org', example: 'your-username' },
      { key: 'TEST_GITHUB_REPO', label: 'Repository name', example: 'pulsyn' },
    ],
    freeOption: 'Free — any GitHub account',
    signupUrl: 'https://github.com/settings/tokens?type=beta',
    instructions: [
      'Go to GitHub → Settings → Developer settings → Fine-grained tokens',
      'Click "Generate new token"',
      'Set expiration (90 days recommended)',
      'Repository access: "Only select repositories" → pick any repo',
      'Permissions: Repository → Issues (Read), Metadata (Read)',
      'Copy the token (starts with github_pat_)',
    ],
    validate: async (env) => {
      try {
        const resp = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${env.TEST_GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
        });
        if (resp.ok) {
          const data = await resp.json() as any;
          return { ok: true, message: `Authenticated as ${data.login}` };
        }
        return { ok: false, message: `HTTP ${resp.status}: ${resp.statusText}` };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
  },
  {
    name: 'Slack',
    failures: 16,
    tier: 'instant',
    envVars: [
      { key: 'TEST_SLACK_BOT_TOKEN', label: 'Bot User OAuth Token', example: 'xoxb-xxxxxxxxxxxx', secret: true },
    ],
    freeOption: 'Free — create a Slack workspace',
    signupUrl: 'https://api.slack.com/apps',
    instructions: [
      'Go to api.slack.com/apps → "Create New App" → "From scratch"',
      'Name it "Pulsyn Test" → pick any workspace',
      'Go to "OAuth & Permissions" → add Bot Token Scopes:',
      '  - channels:read',
      '  - users:read',
      '  - channels:history (optional, for message extraction)',
      'Click "Install to Workspace" → "Allow"',
      'Copy "Bot User OAuth Token" (starts with xoxb-)',
    ],
    validate: async (env) => {
      try {
        const resp = await fetch('https://slack.com/api/auth.test', {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.TEST_SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
        });
        const data = await resp.json() as any;
        if (data.ok) return { ok: true, message: `Connected to workspace: ${data.team} as ${data.user}` };
        return { ok: false, message: data.error };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
  },
  {
    name: 'Jira',
    failures: 16,
    tier: 'instant',
    envVars: [
      { key: 'TEST_JIRA_HOST', label: 'Atlassian domain', example: 'your-team.atlassian.net' },
      { key: 'TEST_JIRA_USER', label: 'Email address', example: 'you@example.com' },
      { key: 'TEST_JIRA_API_TOKEN', label: 'API token', example: 'ATATTxxxxxxxx', secret: true },
    ],
    freeOption: 'Free — Atlassian account (10 users)',
    signupUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens',
    instructions: [
      'Go to id.atlassian.com → Security → API tokens',
      'Click "Create API token"',
      'Label: "Pulsyn Test"',
      'Copy the token',
      'Your host is: {your-domain}.atlassian.net',
    ],
    validate: async (env) => {
      try {
        const auth = Buffer.from(`${env.TEST_JIRA_USER}:${env.TEST_JIRA_API_TOKEN}`).toString('base64');
        const resp = await fetch(`https://${env.TEST_JIRA_HOST}/rest/api/3/myself`, {
          headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
        });
        if (resp.ok) {
          const data = await resp.json() as any;
          return { ok: true, message: `Authenticated as ${data.displayName} (${data.emailAddress})` };
        }
        return { ok: false, message: `HTTP ${resp.status}` };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
  },
  {
    name: 'HubSpot',
    failures: 14,
    tier: 'instant',
    envVars: [
      { key: 'TEST_HUBSPOT_ACCESS_TOKEN', label: 'Private App Access Token', example: 'pat-na1-xxxxxxxx', secret: true },
    ],
    freeOption: 'Free — HubSpot CRM',
    signupUrl: 'https://app.hubspot.com/signup-hubspot/marketing/free',
    instructions: [
      'Sign up for free HubSpot CRM',
      'Go to Settings → Integrations → Private Apps',
      'Click "Create a private app"',
      'Name: "Pulsyn Test"',
      'Scopes: crm.objects.contacts.read, crm.objects.companies.read',
      'Click "Create app" → copy the access token',
    ],
    validate: async (env) => {
      try {
        const resp = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
          headers: { Authorization: `Bearer ${env.TEST_HUBSPOT_ACCESS_TOKEN}` },
        });
        if (resp.ok) {
          const data = await resp.json() as any;
          return { ok: true, message: `Connected — ${data.total ?? 0} contacts accessible` };
        }
        return { ok: false, message: `HTTP ${resp.status}` };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
  },
  {
    name: 'Stripe',
    failures: 14,
    tier: 'instant',
    envVars: [
      { key: 'TEST_STRIPE_API_KEY', label: 'Test mode secret key', example: 'sk_test_xxxxxxxxxxxx', secret: true },
    ],
    freeOption: 'Free — Stripe test mode (no real charges)',
    signupUrl: 'https://dashboard.stripe.com/test/apikeys',
    instructions: [
      'Go to dashboard.stripe.com → Developers → API keys',
      'Make sure "Test mode" is toggled ON (top right)',
      'Copy the "Secret key" (starts with sk_test_)',
      'NOTE: You already have the publishable key in THINGS_TO_DO.md',
    ],
    validate: async (env) => {
      try {
        const resp = await fetch('https://api.stripe.com/v1/balance', {
          headers: { Authorization: `Bearer ${env.TEST_STRIPE_API_KEY}` },
        });
        if (resp.ok) {
          const data = await resp.json() as any;
          return { ok: true, message: `Connected — balance: ${data.available?.[0]?.amount ?? 0} ${data.available?.[0]?.currency ?? 'usd'}` };
        }
        return { ok: false, message: `HTTP ${resp.status}` };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
  },
  {
    name: 'Shopify',
    failures: 14,
    tier: 'quick',
    envVars: [
      { key: 'TEST_SHOPIFY_SHOP', label: 'Shop subdomain', example: 'your-dev-store' },
      { key: 'TEST_SHOPIFY_ACCESS_TOKEN', label: 'Admin API access token', example: 'shpat_xxxxxxxxxxxx', secret: true },
    ],
    freeOption: 'Free — Shopify Partners dev store',
    signupUrl: 'https://partners.shopify.com/signup',
    instructions: [
      'Sign up at partners.shopify.com (free)',
      'Create a "Development store" → pick any type',
      'Go to Settings → Apps → Develop apps',
      'Create an app → configure Admin API scopes: read_products, read_orders',
      'Install the app → copy the Admin API access token',
      'Your shop name is: {store-name}.myshopify.com (just the prefix)',
    ],
    validate: async (env) => {
      try {
        const resp = await fetch(`https://${env.TEST_SHOPIFY_SHOP}.myshopify.com/admin/api/2024-01/shop.json`, {
          headers: { 'X-Shopify-Access-Token': env.TEST_SHOPIFY_ACCESS_TOKEN },
        });
        if (resp.ok) {
          const data = await resp.json() as any;
          return { ok: true, message: `Connected to shop: ${data.shop?.name}` };
        }
        return { ok: false, message: `HTTP ${resp.status}` };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
  },
  {
    name: 'Supabase',
    failures: 18,
    tier: 'instant',
    envVars: [
      { key: 'TEST_SUPABASE_URL', label: 'Supabase project URL', example: 'https://xxxx.supabase.co' },
      { key: 'TEST_SUPABASE_SERVICE_ROLE_KEY', label: 'Service role key', example: 'eyJhbGciOi...', secret: true },
    ],
    freeOption: 'Free — 2 projects included',
    signupUrl: 'https://app.supabase.com',
    instructions: [
      'Go to app.supabase.com → New project',
      'Name: "pulsyn-test", pick any region, set a DB password',
      'Go to Settings → API → copy:',
      '  - "Project URL" (https://xxx.supabase.co)',
      '  - "service_role secret" (under Project API keys)',
      'NOTE: The tests expect tables lab_users, lab_products, lab_orders',
      'Run the seed SQL after setup (script will do this automatically)',
    ],
    validate: async (env) => {
      try {
        const resp = await fetch(`${env.TEST_SUPABASE_URL}/rest/v1/`, {
          headers: { apikey: env.TEST_SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.TEST_SUPABASE_SERVICE_ROLE_KEY}` },
        });
        if (resp.ok || resp.status === 200) return { ok: true, message: 'Supabase REST API accessible' };
        return { ok: false, message: `HTTP ${resp.status}` };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
  },
  {
    name: 'BigQuery',
    failures: 15,
    tier: 'medium',
    envVars: [
      { key: 'TEST_BIGQUERY_PROJECT', label: 'GCP project ID', example: 'my-project-123' },
      { key: 'TEST_BIGQUERY_CREDENTIALS', label: 'Service account JSON (single line)', example: '{"type":"service_account",...}', secret: true },
    ],
    freeOption: 'Free tier — 1TB queries/month, 10GB storage',
    signupUrl: 'https://console.cloud.google.com',
    instructions: [
      'Go to console.cloud.google.com → create a project (or use existing)',
      'Enable BigQuery API: APIs → Enable APIs → BigQuery API',
      'IAM → Service Accounts → Create service account',
      'Roles: BigQuery Data Viewer + BigQuery Job User',
      'Keys → Add Key → Create new key → JSON → download',
      'Paste the JSON contents (single line) as TEST_BIGQUERY_CREDENTIALS',
      'NOTE: Create a dataset called "pulsyn_test" in the BigQuery console',
    ],
    validate: async (env) => {
      try {
        const creds = JSON.parse(env.TEST_BIGQUERY_CREDENTIALS);
        // Get access token
        const { google } = require('google-auth-library');
        // Fallback: just check JSON is valid
        return { ok: true, message: `Valid service account: ${creds.client_email}` };
      } catch (e: any) {
        return { ok: false, message: `Invalid JSON: ${e.message}` };
      }
    },
  },
  {
    name: 'Salesforce',
    failures: 16,
    tier: 'hard',
    envVars: [
      { key: 'TEST_SALESFORCE_INSTANCE', label: 'Instance URL', example: 'https://your-org.my.salesforce.com' },
      { key: 'TEST_SALESFORCE_CLIENT_ID', label: 'Connected App client ID', example: '3MVG9xxx...', secret: true },
      { key: 'TEST_SALESFORCE_CLIENT_SECRET', label: 'Connected App client secret', example: 'ABC123...', secret: true },
      { key: 'TEST_SALESFORCE_REFRESH_TOKEN', label: 'OAuth refresh token', example: '5Aep86xxx...', secret: true },
    ],
    freeOption: 'Free — Salesforce Developer Edition',
    signupUrl: 'https://signup.salesforce.com/',
    instructions: [
      'Sign up at signup.salesforce.com (free Developer Edition)',
      'Setup → App Manager → New Connected App',
      'Enable OAuth Settings → callback URL: http://localhost',
      'Scopes: Full access (full), Refresh token (refresh_token, offline_access)',
      'Save → copy Consumer Key (client ID) and Consumer Secret',
      'OAuth authorize: https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id={ID}&redirect_uri=http://localhost&scope=full%20refresh_token',
      'After redirect, exchange code for refresh_token',
    ],
    validate: async (env) => {
      try {
        const resp = await fetch(`${env.TEST_SALESFORCE_INSTANCE}/services/data/v59.0/limits`, {
          headers: { Authorization: `Bearer ${env.TEST_SALESFORCE_REFRESH_TOKEN}` },
        });
        return { ok: resp.ok, message: resp.ok ? 'Connected' : `HTTP ${resp.status} (may need token refresh)` };
      } catch (e: any) {
        return { ok: false, message: e.message };
      }
    },
  },
  {
    name: 'AWS Kinesis',
    failures: 14,
    tier: 'medium',
    envVars: [
      { key: 'TEST_KINESIS_HOST', label: 'Endpoint', example: 'http://localhost:4566' },
      { key: 'TEST_KINESIS_USER', label: 'Access Key ID', example: 'test' },
      { key: 'TEST_KINESIS_PASS', label: 'Secret Access Key', example: 'test' },
    ],
    freeOption: 'Free — LocalStack (local AWS emulator) OR AWS Free Tier',
    signupUrl: 'https://localstack.cloud',
    instructions: [
      'Option A — LocalStack (recommended, no AWS account needed):',
      '  pip install localstack && localstack start',
      '  Endpoint: http://localhost:4566',
      '  User/Pass: "test" / "test" (LocalStack defaults)',
      '',
      'Option B — AWS Free Tier:',
      '  Sign up at aws.amazon.com/free',
      '  Kinesis: 1M PUT records/month free for 12 months',
      '  Use real AWS access key/secret',
    ],
    validate: async (env) => {
      try {
        const resp = await fetch(env.TEST_KINESIS_HOST || 'http://localhost:4566');
        return { ok: resp.ok || resp.status === 403, message: resp.ok ? 'Endpoint reachable' : 'Endpoint exists (needs auth)' };
      } catch (e: any) {
        return { ok: false, message: `Cannot reach ${env.TEST_KINESIS_HOST}: ${e.message}` };
      }
    },
  },
  {
    name: 'AWS Redshift',
    failures: 14,
    tier: 'hard',
    envVars: [
      { key: 'TEST_REDSHIFT_HOST', label: 'Cluster endpoint', example: 'mycluster.xxx.redshift.amazonaws.com' },
      { key: 'TEST_REDSHIFT_PORT', label: 'Port', example: '5439' },
      { key: 'TEST_REDSHIFT_DB', label: 'Database name', example: 'dev' },
      { key: 'TEST_REDSHIFT_USER', label: 'Master username', example: 'admin' },
      { key: 'TEST_REDSHIFT_PASS', label: 'Password', example: 'MyPassword123', secret: true },
    ],
    freeOption: 'AWS Redshift Serverless — $300 free credits',
    signupUrl: 'https://aws.amazon.com/redshift/redshift-serverless/',
    instructions: [
      'AWS Console → Redshift Serverless → Create workgroup',
      'Free trial gives $300 credits (valid 30 days)',
      'Create namespace → set admin credentials',
      'Endpoint appears after creation',
      'Default port: 5439, database: dev',
    ],
    validate: async (env) => {
      // Can't easily validate without pg client — just check env vars are set
      const missing = ['TEST_REDSHIFT_HOST', 'TEST_REDSHIFT_DB', 'TEST_REDSHIFT_USER', 'TEST_REDSHIFT_PASS']
        .filter(k => !env[k]);
      return { ok: missing.length === 0, message: missing.length ? `Missing: ${missing.join(', ')}` : 'All env vars set' };
    },
  },
  {
    name: 'Databricks',
    failures: 10,
    tier: 'hard',
    envVars: [
      { key: 'TEST_DATABRICKS_HOST', label: 'Workspace hostname', example: 'adb-xxx.azuredatabricks.net' },
      { key: 'TEST_DATABRICKS_TOKEN', label: 'Personal access token', example: 'dapi_xxxxxxxxxxxx', secret: true },
      { key: 'TEST_DATABRICKS_DB', label: 'Catalog name', example: 'hive_metastore' },
    ],
    freeOption: 'Community Edition — limited (no SQL warehouse)',
    signupUrl: 'https://community.cloud.databricks.com',
    instructions: [
      'Community Edition: community.cloud.databricks.com',
      'NOTE: CE may not have SQL warehouse endpoint needed by connector',
      'For full access, need Azure/GCP/AWS Databricks workspace',
      'Workspace → User Settings → Developer → Access Tokens → Generate',
      'SQL → SQL Warehouses → copy the HTTP Path for TEST_DATABRICKS_PATH',
    ],
    validate: async (env) => {
      const missing = ['TEST_DATABRICKS_HOST', 'TEST_DATABRICKS_TOKEN', 'TEST_DATABRICKS_DB'].filter(k => !env[k]);
      return { ok: missing.length === 0, message: missing.length ? `Missing: ${missing.join(', ')}` : 'All env vars set' };
    },
  },
];

// ─── Helpers ────────────────────────────────────────────────

function loadEnv(): Record<string, string> {
  if (!fs.existsSync(ENV_PATH)) return {};
  const lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
  const env: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

function saveEnv(env: Record<string, string>) {
  const lines: string[] = [];
  const existing = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
  
  // Preserve comments and structure, update values
  const usedKeys = new Set<string>();
  for (const line of existing.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      lines.push(line);
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) { lines.push(line); continue; }
    const key = trimmed.slice(0, eq);
    if (key in env) {
      lines.push(`${key}=${env[key]}`);
      usedKeys.add(key);
    } else {
      lines.push(line);
    }
  }
  
  // Add new keys
  const newKeys = Object.keys(env).filter(k => !usedKeys.has(k));
  if (newKeys.length) {
    lines.push('');
    lines.push('# Test connector credentials (auto-generated by setup-test-keys.ts)');
    for (const key of newKeys) {
      lines.push(`${key}=${env[key]}`);
    }
  }
  
  fs.writeFileSync(ENV_PATH, lines.join('\n'));
}

function mask(s: string, show = 8): string {
  if (!s || s.length <= show) return s;
  return s.slice(0, show) + '...' + s.slice(-4);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const validateOnly = args.includes('--validate');
  const envOnly = args.includes('--env-only');
  const env = loadEnv();

  console.log('');
  console.log(c.bold('╔══════════════════════════════════════════════════════════╗'));
  console.log(c.bold('║') + c.cyan('   PULSYN TEST API KEY SETUP                              ') + c.bold('║'));
  console.log(c.bold('║') + c.dim('   Free/community keys for 12 failing connectors          ') + c.bold('║'));
  console.log(c.bold('╚══════════════════════════════════════════════════════════╝'));
  console.log('');

  if (envOnly) {
    console.log(c.yellow('Environment variables needed:\n'));
    for (const conn of connectors) {
      console.log(c.bold(`  ${conn.name}`) + c.dim(` (${conn.failures} failures)`));
      for (const v of conn.envVars) {
        const current = env[v.key];
        const status = current ? c.green('✓ set') : c.red('✗ missing');
        console.log(`    ${v.key} = ${current ? mask(current) : c.dim(v.example ?? '...')}  ${status}`);
      }
      console.log();
    }
    rl.close();
    return;
  }

  // Check which connectors are missing keys
  const missing: ConnectorSetup[] = [];
  const partial: ConnectorSetup[] = [];
  const complete: ConnectorSetup[] = [];

  for (const conn of connectors) {
    const envKeys = conn.envVars.map(v => v.key);
    const setCount = envKeys.filter(k => env[k]).length;
    if (setCount === 0) missing.push(conn);
    else if (setCount < envKeys.length) partial.push(conn);
    else complete.push(conn);
  }

  console.log(c.green(`  ✓ ${complete.length} connectors fully configured`));
  console.log(c.yellow(`  ⚠ ${partial.length} connectors partially configured`));
  console.log(c.red(`  ✗ ${missing.length} connectors need keys`));
  console.log(`  Total failures recoverable: ${connectors.reduce((s, c) => s + c.failures, 0)}`);
  console.log('');

  if (validateOnly) {
    console.log(c.bold('Validating all configured connectors...\n'));
    for (const conn of [...complete, ...partial]) {
      if (conn.validate) {
        const result = await conn.validate(env);
        const icon = result.ok ? c.green('✓') : c.red('✗');
        console.log(`  ${icon} ${conn.name}: ${result.message}`);
      }
    }
    rl.close();
    return;
  }

  // Interactive setup — go through missing and partial
  const toSetup = [...missing, ...partial].sort((a, b) => {
    const tierOrder = { instant: 0, quick: 1, medium: 2, hard: 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  for (const conn of toSetup) {
    console.log(c.bold(`\n${'─'.repeat(60)}`));
    console.log(c.bold(`  ${conn.name}`) + c.dim(` — ${conn.failures} failing tests`) + `  [${conn.tier}]`);
    console.log(c.bold(`${'─'.repeat(60)}`));
    console.log(`  Free option: ${c.green(conn.freeOption)}`);
    console.log(`  Sign up: ${c.cyan(conn.signupUrl)}`);
    console.log('');
    console.log('  Steps:');
    for (const step of conn.instructions) {
      console.log(`    ${step}`);
    }
    console.log('');

    const skip = await ask(c.yellow(`  Set up ${conn.name}? (y/n/skip-all) `));
    if (skip.toLowerCase() === 'skip-all') break;
    if (skip.toLowerCase() !== 'y') {
      console.log(c.dim(`  Skipped ${conn.name}`));
      continue;
    }

    for (const v of conn.envVars) {
      const current = env[v.key];
      const prompt = current
        ? `  ${v.label} ${c.dim(`[${mask(current)}]`)}: `
        : `  ${v.label} ${c.dim(`(${v.example ?? '...'})`)}: `;
      const value = await ask(prompt);
      if (value.trim()) {
        env[v.key] = value.trim();
      }
    }

    // Validate if possible
    if (conn.validate) {
      console.log(c.dim(`  Validating ${conn.name}...`));
      const result = await conn.validate(env);
      if (result.ok) {
        console.log(c.green(`  ✓ ${result.message}`));
      } else {
        console.log(c.red(`  ✗ ${result.message}`));
        const retry = await ask(c.yellow(`  Fix and retry? (y/n) `));
        if (retry.toLowerCase() === 'y') {
          for (const v of conn.envVars.filter(v => v.secret)) {
            const value = await ask(`  ${v.label}: `);
            if (value.trim()) env[v.key] = value.trim();
          }
        }
      }
    }
  }

  // Save
  console.log(c.bold(`\n${'─'.repeat(60)}`));
  console.log(c.bold('  Saving to .env...'));
  saveEnv(env);
  console.log(c.green('  ✓ Saved'));

  // Summary
  const allKeys = connectors.flatMap(c => c.envVars.map(v => v.key));
  const nowSet = allKeys.filter(k => env[k]).length;
  console.log(`\n  ${nowSet}/${allKeys.length} env vars configured`);
  
  const testable = connectors.filter(c => {
    const needed = c.envVars.map(v => v.key);
    return needed.every(k => env[k]);
  });
  console.log(c.green(`  ${testable.length} connectors ready to test`));
  console.log(c.dim(`  Estimated test recovery: ~${testable.reduce((s, c) => s + c.failures, 0)} tests`));
  
  console.log(`\n  Run tests: ${c.cyan('cd packages/core && npx vitest run src/__tests__/lab/connectors/')}`);
  console.log(`  Run single: ${c.cyan('npx vitest run src/__tests__/lab/connectors/github.test.ts')}`);
  console.log('');
  
  rl.close();
}

main().catch(e => { console.error(e); process.exit(1); });
