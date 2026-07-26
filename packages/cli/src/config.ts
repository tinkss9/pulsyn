// Pulsyn CLI Configuration
// Manages ~/.pulsyn/config.json

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface CliConfig {
  baseUrl: string;
  apiKey?: string;
  outputFormat: 'table' | 'json';
}

// Lazy initialization so mocks can override homedir()
let _configDir: string | null = null;
let _configFile: string | null = null;

function getConfigDir(): string {
  if (!_configDir) _configDir = join(homedir(), '.pulsyn');
  return _configDir;
}

function getConfigFile(): string {
  if (!_configFile) _configFile = join(getConfigDir(), 'config.json');
  return _configFile;
}

const DEFAULT_CONFIG: CliConfig = {
  baseUrl: 'http://localhost:8080',
  outputFormat: 'table',
};

export function getConfigPath(): string {
  return getConfigFile();
}

export function loadConfig(): CliConfig {
  try {
    const configFile = getConfigFile();
    if (existsSync(configFile)) {
      const raw = readFileSync(configFile, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // Fall through to defaults
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: CliConfig): void {
  const configDir = getConfigDir();
  const configFile = getConfigFile();
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  writeFileSync(configFile, JSON.stringify(config, null, 2));
}

export function updateConfig(partial: Partial<CliConfig>): CliConfig {
  const config = { ...loadConfig(), ...partial };
  saveConfig(config);
  return config;
}

// Reset cached paths (for testing)
export function _resetConfigPaths(): void {
  _configDir = null;
  _configFile = null;
}
