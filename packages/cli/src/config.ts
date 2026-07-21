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

const CONFIG_DIR = join(homedir(), '.pulsyn');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: CliConfig = {
  baseUrl: 'http://localhost:8080',
  outputFormat: 'table',
};

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(): CliConfig {
  try {
    if (existsSync(CONFIG_FILE)) {
      const raw = readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // Fall through to defaults
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: CliConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function updateConfig(partial: Partial<CliConfig>): CliConfig {
  const config = { ...loadConfig(), ...partial };
  saveConfig(config);
  return config;
}
