import { execSync } from 'child_process';
import * as path from 'path';

function resolveApiKey(provider: string): string {
  const envKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (envKey) return envKey;

  try {
    const helper = path.join(process.env.USERPROFILE || '', '.kimi', 'bin', 'cred-helper.ps1');
    const psScript = `Import-Module '${helper}'; Get-AiCredential -Provider '${provider}'`;
    const result = execSync(
      `powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 15000 }
    ).trim();
    if (result && result.length > 10) return result;
  } catch {}

  return '';
}

async function testAPI() {
  console.log('=== API Call Test ===\n');

  const key = resolveApiKey('deepseek');
  if (!key) {
    console.log('ERROR: No DeepSeek API key found');
    return;
  }
  console.log(`DeepSeek key: ${key.length} chars\n`);

  console.log('Calling DeepSeek API...');
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Say "Hello from DeepSeek" and nothing else.' }],
      max_tokens: 50,
      temperature: 0,
    }),
  });

  console.log(`Status: ${resp.status}`);

  if (!resp.ok) {
    const errText = await resp.text();
    console.log(`Error: ${errText.substring(0, 200)}`);
    return;
  }

  const data = await resp.json() as any;
  const content = data.choices?.[0]?.message?.content || 'NO CONTENT';
  const tokensIn = data.usage?.prompt_tokens || 0;
  const tokensOut = data.usage?.completion_tokens || 0;

  console.log(`Response: ${content}`);
  console.log(`Tokens: ${tokensIn} in / ${tokensOut} out`);
  console.log(`Cost: $${((tokensIn * 0.00014 + tokensOut * 0.00028) / 1000).toFixed(6)}`);
  console.log('\nAPI call SUCCESS');
}

testAPI().catch(e => console.error('Fatal:', e));
