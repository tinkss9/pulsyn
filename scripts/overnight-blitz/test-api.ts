import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Test API key resolution
function resolveApiKey(provider: string): string {
  const envKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (envKey) {
    console.log(`  ${provider}: found via env (${envKey.length} chars)`);
    return envKey;
  }

  try {
    const credNames: Record<string, string> = {
      deepseek: 'DeepSeek',
      kimi: 'Kimi',
      gemini: 'Google',
      groq: 'Groq',
    };
    const credName = credNames[provider] || provider;
    const psScript = `
      $creds = cmdkey /list 2>$null
      $found = $false
      foreach ($line in $creds) {
        if ($line -match '${credName}') { $found = $true }
        if ($found -and $line -match 'password = (.+)') {
          Write-Output $matches[1]
          break
        }
      }
    `;
    const result = execSync(`powershell -Command "${psScript.replace(/"/g, '\\"')}"`, { encoding: 'utf8', timeout: 15000 }).trim();
    if (result && result.length > 10) {
      console.log(`  ${provider}: found via credmgr (${result.length} chars)`);
      return result;
    }
  } catch (e: any) {
    console.log(`  ${provider}: credmgr failed: ${e.message?.substring(0, 80)}`);
  }

  console.log(`  ${provider}: NOT FOUND`);
  return '';
}

console.log('=== API Key Resolution Test ===\n');
const providers = ['deepseek', 'kimi', 'gemini', 'groq'];
const keys: Record<string, string> = {};
for (const p of providers) {
  keys[p] = resolveApiKey(p);
}

const available = Object.entries(keys).filter(([, v]) => v.length > 0);
console.log(`\nAvailable providers: ${available.length}/${providers.length}`);
available.forEach(([name]) => console.log(`  OK: ${name}`));

if (available.length === 0) {
  console.log('\nNo API keys found. Setting up test with DeepSeek...');
  // Try to get from credential manager more aggressively
  try {
    const result = execSync('powershell -Command "cmdkey /list"', { encoding: 'utf8', timeout: 10000 });
    const lines = result.split('\n').filter(l => l.toLowerCase().includes('deep') || l.toLowerCase().includes('kimi') || l.toLowerCase().includes('google'));
    console.log('Relevant cred lines:', lines.slice(0, 5).join('\n'));
  } catch {}
}
