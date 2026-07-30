import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

function resolveApiKey(provider: string): string {
  const envKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (envKey) return envKey;
  try {
    const helper = path.join(process.env.USERPROFILE || '', '.kimi', 'bin', 'cred-helper.ps1');
    const psScript = `Import-Module '${helper}'; Get-AiCredential -Provider '${provider}'`;
    const result = execSync(`powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`, { encoding: 'utf8', timeout: 15000 }).trim();
    if (result && result.length > 10) return result;
  } catch {}
  return '';
}

function extractCodeBlock(response: string): string {
  const match = response.match(/```(?:typescript|ts)?\s*\n([\s\S]*?)```/);
  if (match) return match[1].trim();
  if (response.includes('@registerSource') || response.includes('extends BaseConnector')) return response.trim();
  return response.trim();
}

async function testConnectorGen() {
  console.log('=== Connector Generation Test ===\n');

  const key = resolveApiKey('deepseek');
  console.log(`DeepSeek key: ${key.length} chars\n`);

  const prompt = `You are a TypeScript developer generating a Pulsyn CDC connector.

Generate a complete TypeScript connector file for "stripe" (payment category).

Requirements:
1. Import from '../registry' and '../base'
2. Use @registerSource('stripe') decorator
3. Extend BaseConnector
4. Implement ALL required methods: connect(), disconnect(), testConnection(), getTables(), getTableSchema(), startCDC(), stopCDC()
5. Use proper TypeScript types (NO 'any' types)
6. Auth type: bearer
7. API style: rest
8. Include proper error handling
9. Implement extractFull() and extractIncremental() with real fetch calls to Stripe API

Output ONLY the TypeScript code in a single code block. No explanations.`;

  console.log('Calling DeepSeek to generate stripe connector...');
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 3000, temperature: 0 }),
  });

  if (!resp.ok) {
    console.log(`API error: ${resp.status}`);
    return;
  }

  const data = await resp.json() as any;
  const content = data.choices?.[0]?.message?.content || '';
  const tokensIn = data.usage?.prompt_tokens || 0;
  const tokensOut = data.usage?.completion_tokens || 0;
  const cost = (tokensIn * 0.00014 + tokensOut * 0.00028) / 1000;

  console.log(`Tokens: ${tokensIn} in / ${tokensOut} out | Cost: $${cost.toFixed(4)}\n`);

  const code = extractCodeBlock(content);
  console.log(`Generated code: ${code.length} chars\n`);

  // Verify gates
  const checks = {
    'has @registerSource': code.includes("@registerSource('stripe')") || code.includes('@registerSource'),
    'extends BaseConnector': code.includes('extends BaseConnector'),
    'has connect()': code.includes('async connect('),
    'has disconnect()': code.includes('async disconnect('),
    'has getTables()': code.includes('async getTables('),
    'no : any': !code.includes(': any'),
  };

  console.log('Verification gates:');
  let allPass = true;
  for (const [check, result] of Object.entries(checks)) {
    console.log(`  ${result ? 'PASS' : 'FAIL'} ${check}`);
    if (!result) allPass = false;
  }

  // Write to test file
  const testDir = path.join(process.cwd(), 'scripts/overnight-blitz', 'test-output');
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(path.join(testDir, 'stripe.ts'), code, 'utf8');
  console.log(`\nWritten to: scripts/overnight-blitz/test-output/stripe.ts`);
  console.log(`\nFirst 20 lines:`);
  code.split('\n').slice(0, 20).forEach((l, i) => console.log(`  ${i + 1}: ${l}`));

  console.log(`\n${allPass ? 'ALL GATES PASSED' : 'SOME GATES FAILED'}`);
}

testConnectorGen().catch(e => console.error('Fatal:', e));
