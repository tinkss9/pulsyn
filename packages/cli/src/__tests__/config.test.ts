// Pulsyn CLI Config Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock the config module to use a temp directory
const TEMP_CONFIG_DIR = join(tmpdir(), `pulsyn-test-${Date.now()}`);
const TEMP_CONFIG_FILE = join(TEMP_CONFIG_DIR, 'config.json');

vi.mock('os', async () => {
  const actual = await vi.importActual<typeof import('os')>('os');
  return {
    ...actual,
    homedir: () => TEMP_CONFIG_DIR,
  };
});

import { loadConfig, saveConfig, updateConfig } from '../config';

describe('CLI Config', () => {
  beforeEach(() => {
    // Clean up
    if (existsSync(TEMP_CONFIG_FILE)) {
      require('fs').unlinkSync(TEMP_CONFIG_FILE);
    }
    if (existsSync(TEMP_CONFIG_DIR)) {
      require('fs').rmSync(TEMP_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEMP_CONFIG_DIR)) {
      require('fs').rmSync(TEMP_CONFIG_DIR, { recursive: true });
    }
  });

  describe('loadConfig', () => {
    it('returns defaults when no config file exists', () => {
      const config = loadConfig();
      expect(config.baseUrl).toBe('http://localhost:8080');
      expect(config.outputFormat).toBe('table');
      expect(config.apiKey).toBeUndefined();
    });

    it('loads config from file when it exists', () => {
      mkdirSync(TEMP_CONFIG_DIR, { recursive: true });
      writeFileSync(TEMP_CONFIG_FILE, JSON.stringify({
        baseUrl: 'http://custom:9090',
        apiKey: 'my-key',
        outputFormat: 'json',
      }));

      const config = loadConfig();
      expect(config.baseUrl).toBe('http://custom:9090');
      expect(config.apiKey).toBe('my-key');
      expect(config.outputFormat).toBe('json');
    });

    it('merges with defaults for missing fields', () => {
      mkdirSync(TEMP_CONFIG_DIR, { recursive: true });
      writeFileSync(TEMP_CONFIG_FILE, JSON.stringify({
        baseUrl: 'http://custom:9090',
      }));

      const config = loadConfig();
      expect(config.baseUrl).toBe('http://custom:9090');
      expect(config.outputFormat).toBe('table');
    });
  });

  describe('saveConfig', () => {
    it('creates config directory if it does not exist', () => {
      saveConfig({ baseUrl: 'http://test:8080', outputFormat: 'table' });

      expect(existsSync(TEMP_CONFIG_DIR)).toBe(true);
      expect(existsSync(TEMP_CONFIG_FILE)).toBe(true);
    });

    it('writes config as JSON', () => {
      saveConfig({ baseUrl: 'http://test:8080', apiKey: 'key123', outputFormat: 'json' });

      const raw = readFileSync(TEMP_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed.baseUrl).toBe('http://test:8080');
      expect(parsed.apiKey).toBe('key123');
      expect(parsed.outputFormat).toBe('json');
    });
  });

  describe('updateConfig', () => {
    it('merges partial config with existing', () => {
      saveConfig({ baseUrl: 'http://old:8080', outputFormat: 'table' });
      const updated = updateConfig({ apiKey: 'new-key' });

      expect(updated.baseUrl).toBe('http://old:8080');
      expect(updated.apiKey).toBe('new-key');
      expect(updated.outputFormat).toBe('table');
    });

    it('overwrites existing values', () => {
      saveConfig({ baseUrl: 'http://old:8080', outputFormat: 'table' });
      const updated = updateConfig({ baseUrl: 'http://new:9090' });

      expect(updated.baseUrl).toBe('http://new:9090');
    });
  });
});
