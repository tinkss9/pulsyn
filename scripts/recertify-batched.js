#!/usr/bin/env node
/**
 * Batched re-certification script
 * Runs lab connector tests in small batches to avoid timeout
 * Updates cert-matrix.json with current pass rates
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CERT_MATRIX = path.join(__dirname, '../docs/lab/cert-matrix.json');
const LAB_DIR = path.join(__dirname, '../packages/core/src/__tests__/lab/connectors');
const BATCH_SIZE = 10;
const TIMEOUT_MS = 60000; // 60s per test file

// Get all test files
const testFiles = fs.readdirSync(LAB_DIR)
  .filter(f => f.endsWith('.test.ts'))
  .map(f => f.replace('.test.ts', ''));

console.log(`Found ${testFiles.length} connector test files`);
console.log(`Running in batches of ${BATCH_SIZE}\n`);

const results = {};
let totalPassed = 0;
let totalFailed = 0;
let totalErrors = 0;

for (let i = 0; i < testFiles.length; i += BATCH_SIZE) {
  const batch = testFiles.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(testFiles.length / BATCH_SIZE);
  
  console.log(`Batch ${batchNum}/${totalBatches}: ${batch.join(', ')}`);
  
  for (const connector of batch) {
    const testFile = path.join(LAB_DIR, `${connector}.test.ts`);
    
    try {
      const output = execSync(
        `npx vitest run "${testFile}" --reporter=json 2>&1`,
        { encoding: 'utf8', timeout: TIMEOUT_MS, cwd: path.join(__dirname, '..') }
      );
      
      // Parse JSON output (may have extra text before JSON)
      const jsonMatch = output.match(/\{[\s\S]*"testResults"[\s\S]*\}/);
      if (!jsonMatch) {
        results[connector] = { status: 'ERROR', pass_rate: 0, error: 'No JSON output' };
        totalErrors++;
        continue;
      }
      
      const json = JSON.parse(jsonMatch[0]);
      const testResult = json.testResults?.[0];
      
      if (testResult) {
        const total = testResult.assertionResults?.length || 0;
        const passed = testResult.assertionResults?.filter(a => a.status === 'passed').length || 0;
        const passRate = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;
        
        results[connector] = {
          status: passRate >= 80 ? 'CERTIFIED' : 'IN_PROGRESS',
          pass_rate: passRate,
          lane: 'A',
          tested_at: new Date().toISOString(),
          tests_passed: passed,
          tests_total: total,
        };
        
        if (passRate === 100) totalPassed++;
        else if (passRate >= 80) totalPassed++;
        else totalFailed++;
        
        process.stdout.write(`  ${connector}: ${passRate}% (${passed}/${total}) ${passRate === 100 ? '✓' : passRate >= 80 ? '~' : '✗'}\n`);
      }
    } catch (err) {
      results[connector] = {
        status: 'ERROR',
        pass_rate: 0,
        lane: 'A',
        tested_at: new Date().toISOString(),
        error: err.message?.slice(0, 100),
      };
      totalErrors++;
      process.stdout.write(`  ${connector}: ERROR\n`);
    }
  }
  
  console.log('');
}

// Update cert-matrix.json
const matrix = {
  metadata: {
    version: '3.0',
    created_at: new Date().toISOString(),
    description: 'Pulsyn connector certification matrix — batched re-certification',
    total_connectors: Object.keys(results).length,
    total_certified: Object.values(results).filter(v => v.status === 'CERTIFIED').length,
    methodology: 'Vitest live API tests',
  },
  connectors: results,
};

fs.writeFileSync(CERT_MATRIX, JSON.stringify(matrix, null, 2));

// Summary
const certified = Object.values(results).filter(v => v.status === 'CERTIFIED').length;
const at100 = Object.values(results).filter(v => v.pass_rate === 100).length;
const at95 = Object.values(results).filter(v => v.pass_rate >= 95 && v.pass_rate < 100).length;
const at80 = Object.values(results).filter(v => v.pass_rate >= 80 && v.pass_rate < 95).length;

console.log('=== RE-CERTIFICATION SUMMARY ===');
console.log(`Total: ${Object.keys(results).length}`);
console.log(`Certified (>=80%): ${certified}`);
console.log(`At 100%: ${at100}`);
console.log(`At 95-99%: ${at95}`);
console.log(`At 80-94%: ${at80}`);
console.log(`Errors: ${totalErrors}`);
console.log(`\nUpdated: ${CERT_MATRIX}`);
