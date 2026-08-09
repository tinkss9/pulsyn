#!/usr/bin/env node
/**
 * Re-certify all connectors with current test results
 * Runs all lab connector tests and updates cert-matrix.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CERT_MATRIX = path.join(__dirname, '../docs/lab/cert-matrix.json');
const LAB_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');

// Get all test files
const testFiles = fs.readdirSync(LAB_DIR)
  .filter(f => f.endsWith('.test.ts'))
  .map(f => f.replace('.test.ts', ''));

console.log(`Found ${testFiles.length} connector test files`);

// Run tests in batches to avoid timeout
const BATCH_SIZE = 50;
const results = {};

for (let i = 0; i < testFiles.length; i += BATCH_SIZE) {
  const batch = testFiles.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(testFiles.length / BATCH_SIZE);
  
  console.log(`\nRunning batch ${batchNum}/${totalBatches} (${batch.length} connectors)...`);
  
  for (const connector of batch) {
    const testFile = path.join(LAB_DIR, `${connector}.test.ts`);
    
    try {
      const output = execSync(
        `npx vitest run "${testFile}" --reporter=json 2>&1`,
        { encoding: 'utf8', timeout: 30000, cwd: path.join(__dirname, '..') }
      );
      
      const json = JSON.parse(output);
      const testResult = json.testResults?.[0];
      
      if (testResult) {
        const total = testResult.assertionResults?.length || 0;
        const passed = testResult.assertionResults?.filter(a => a.status === 'passed').length || 0;
        const passRate = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;
        
        results[connector] = {
          status: passRate >= 80 ? 'CERTIFIED' : 'IN_PROGRESS',
          pass_rate: passRate,
          lane: 'A', // Default to Lane A (SaaS)
          tested_at: new Date().toISOString(),
          tests_passed: passed,
          tests_total: total,
        };
      }
    } catch (err) {
      // Test failed to run
      results[connector] = {
        status: 'FAILED',
        pass_rate: 0,
        lane: 'A',
        tested_at: new Date().toISOString(),
        error: err.message?.slice(0, 200),
      };
    }
  }
}

// Update cert-matrix.json
const matrix = {
  metadata: {
    version: '3.0',
    created_at: new Date().toISOString(),
    description: 'Pulsyn connector certification matrix — automated re-certification',
    total_connectors: Object.keys(results).length,
    total_certified: Object.values(results).filter(v => v.status === 'CERTIFIED').length,
    methodology: 'Vitest live API tests + Docker database tests',
  },
  connectors: results,
};

fs.writeFileSync(CERT_MATRIX, JSON.stringify(matrix, null, 2));

// Summary
const certified = Object.values(results).filter(v => v.status === 'CERTIFIED').length;
const at100 = Object.values(results).filter(v => v.pass_rate === 100).length;
const at95 = Object.values(results).filter(v => v.pass_rate >= 95 && v.pass_rate < 100).length;
const failed = Object.values(results).filter(v => v.status === 'FAILED').length;

console.log('\n=== RE-CERTIFICATION SUMMARY ===');
console.log(`Total: ${Object.keys(results).length}`);
console.log(`Certified: ${certified}`);
console.log(`At 100%: ${at100}`);
console.log(`At 95%+: ${at95}`);
console.log(`Failed: ${failed}`);
console.log(`\nUpdated: ${CERT_MATRIX}`);
