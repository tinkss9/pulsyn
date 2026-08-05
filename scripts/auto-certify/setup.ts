#!/usr/bin/env npx tsx
/**
 * Pulsyn Autonomous Certification Setup
 *
 * Initializes directories, creates config files, and validates prerequisites.
 *
 * Usage: npm run cert:setup
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function logSection(msg: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${msg}`);
  console.log(`${'='.repeat(70)}\n`);
}

async function main() {
  logSection('PULSYN AUTONOMOUS CERTIFICATION SETUP');

  // ─── 1. Create directories ───────────────────────────────────

  log('📁 Creating directories...');

  const dirs = [
    'docs/lab/results',
    'docs/lab/metrics',
    'scripts/auto-certify',
    '.github/workflows',
  ];

  dirs.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`  ✅ ${dir}`);
    } else {
      log(`  ℹ️  ${dir} (already exists)`);
    }
  });

  // ─── 2. Initialize cert matrix ───────────────────────────────

  log('\n📊 Initializing cert matrix...');

  const certMatrixFile = path.join(process.cwd(), 'docs/lab/cert-matrix.json');
  if (!fs.existsSync(certMatrixFile)) {
    const initialMatrix = {
      metadata: {
        version: '1.0',
        created_at: new Date().toISOString(),
        description: 'Pulsyn connector certification matrix',
      },
      connectors: {},
    };
    fs.writeFileSync(certMatrixFile, JSON.stringify(initialMatrix, null, 2));
    log(`  ✅ Created: ${certMatrixFile}`);
  } else {
    log(`  ℹ️  ${certMatrixFile} (already exists)`);
  }

  // ─── 3. Create Docker Compose health check script ────────────

  log('\n🐳 Setting up Docker health checks...');

  const healthCheckScript = path.join(process.cwd(), 'scripts/check-lab-health.sh');
  const healthCheckContent = `#!/bin/bash
# Pulsyn Lab Health Check

SERVICES=(
  "postgres:5432"
  "mysql:3306"
  "mongodb:27017"
  "redis:6379"
  "mssql:1433"
  "clickhouse:8123"
)

echo "🔍 Lab Health Check"
echo "===================="

UNHEALTHY=0

for service in "\${SERVICES[@]}"; do
  IFS=':' read -r host port <<< "$service"

  if nc -z localhost $port 2>/dev/null; then
    echo "✅ $host:$port"
  else
    echo "❌ $host:$port (unreachable)"
    UNHEALTHY=$((UNHEALTHY + 1))
  fi
done

echo ""
if [ $UNHEALTHY -eq 0 ]; then
  echo "✅ All services healthy"
  exit 0
else
  echo "❌ $UNHEALTHY service(s) unhealthy"
  exit 1
fi
`;

  fs.writeFileSync(healthCheckScript, healthCheckContent);
  if (process.platform !== 'win32') {
    try {
      execSync(`chmod +x ${healthCheckScript}`);
      log(`  ✅ Made executable: ${healthCheckScript}`);
    } catch {
      log(`  ⚠️  Could not make executable: ${healthCheckScript}`);
    }
  } else {
    log(`  ℹ️  Skipped chmod on Windows: ${healthCheckScript}`);
  }
  log(`  ✅ Created: ${healthCheckScript}`);

  // ─── 4. Create environment config ────────────────────────────

  log('\n⚙️  Creating environment config...');

  const envFile = path.join(process.cwd(), '.env.test');
  if (!fs.existsSync(envFile)) {
    const envContent = `# Pulsyn Test Environment Configuration

# Lab Services
TEST_POSTGRES_HOST=localhost
TEST_POSTGRES_PORT=5432
TEST_POSTGRES_USER=test
TEST_POSTGRES_PASSWORD=test
TEST_POSTGRES_DB=testdb

TEST_MYSQL_HOST=localhost
TEST_MYSQL_PORT=3306
TEST_MYSQL_USER=root
TEST_MYSQL_PASSWORD=test
TEST_MYSQL_DB=testdb

TEST_MONGODB_HOST=localhost
TEST_MONGODB_PORT=27017
TEST_MONGODB_USER=test
TEST_MONGODB_PASSWORD=test
TEST_MONGODB_DB=testdb

TEST_REDIS_HOST=localhost
TEST_REDIS_PORT=6379

# Certification Settings
CERT_APPROVAL_THRESHOLD_TIER2=95
CERT_APPROVAL_THRESHOLD_TIER3=95
CERT_APPROVAL_THRESHOLD_TIER4=90
CERT_APPROVAL_THRESHOLD_TIER5=80

CERT_MAX_PARALLEL_WORKERS=3
CERT_PHASE1_DURATION_MINUTES=180
CERT_PHASE2_DURATION_MINUTES=120
CERT_PHASE3_DURATION_MINUTES=180

# Notifications
SLACK_WEBHOOK_URL=
DISCORD_WEBHOOK_URL=
EMAIL_TO=

# CI/CD
CI=false
NODE_ENV=test
`;

    fs.writeFileSync(envFile, envContent);
    log(`  ✅ Created: ${envFile}`);
    log(`  ℹ️  Update .env.test with your webhook URLs`);
  } else {
    log(`  ℹ️  ${envFile} (already exists)`);
  }

  // ─── 5. Verify prerequisites ────────────────────────────────

  log('\n🔍 Verifying prerequisites...');

  const prereqs = [
    { name: 'Node.js', cmd: 'node --version' },
    { name: 'Docker', cmd: 'docker --version' },
    { name: 'Git', cmd: 'git --version' },
    { name: 'npm', cmd: 'npm --version' },
  ];

  let allGood = true;

  prereqs.forEach(({ name, cmd }) => {
    try {
      const version = execSync(cmd, { encoding: 'utf8' }).trim();
      log(`  ✅ ${name}: ${version}`);
    } catch {
      log(`  ❌ ${name} not found`);
      allGood = false;
    }
  });

  // ─── 6. Docker Compose health ────────────────────────────────

  log('\n🐳 Checking Docker Compose...');

  try {
    execSync('docker-compose --version', { encoding: 'utf8' });
    log(`  ✅ Docker Compose available`);
  } catch {
    log(`  ❌ Docker Compose not found`);
    allGood = false;
  }

  // ─── 7. Git configuration ───────────────────────────────────

  log('\n🔐 Verifying Git configuration...');

  try {
    const userName = execSync('git config user.name', { encoding: 'utf8' }).trim();
    const userEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
    log(`  ✅ Git user: ${userName} <${userEmail}>`);
  } catch {
    log(`  ⚠️  Git user not configured`);
    log(`     Run: git config user.name "Your Name"`);
    log(`     Run: git config user.email "your@email.com"`);
  }

  // ─── 8. Summary ──────────────────────────────────────────────

  logSection('SETUP SUMMARY');

  if (allGood) {
    log('✅ All prerequisites met. Ready to run certification.');
    log('\nNext steps:');
    log('  1. Start Docker services: docker-compose -f docker-compose.lab.yml up -d');
    log('  2. Run a test phase: npm run cert:run-local');
    log('  3. Monitor results: npm run cert:monitor');
    log('  4. View cert matrix: cat docs/lab/cert-matrix.json');
  } else {
    log('⚠️  Some prerequisites missing. Please install them and try again.');
    process.exit(1);
  }

  log('\n📚 Documentation:');
  log('  - Controller: scripts/auto-certify/controller.ts');
  log('  - Approval gates: packages/core/src/auto-approval.ts');
  log('  - Workflow: .github/workflows/pulsyn-cert-nightly.yml');
  log('\n💤 To run nightly (8 hours): npm run cert:run');
  log('💻 To test locally (1 iteration): npm run cert:run-local\n');
}

main().catch((err) => {
  console.error(`❌ Setup failed: ${err.message}`);
  process.exit(1);
});
