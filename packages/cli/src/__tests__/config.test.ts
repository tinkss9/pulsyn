// Pulsyn CLI Config Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir, homedir } from 'os';

// Use the real homedir for testing (works without mocking)
const REAL_HOME = homedir();
const CONFIG_DIR = join(REAL_HOME, '.pulsyn');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const BACKUP_FILE = join(CONFIG_DIR, 'config.test-backup.json');

describe('CLI Config', () => {
  let loadConfig: any;
  let saveConfig: any;
  let updateConfig: any;

  beforeEach(async () => {
    // Backup existing config if present
    if (existsSync(CONFIG_FILE)) {
      const data = readFileSync(CONFIG_FILE, 'utf-8');
      writeFileSync(BACKUP_FILE, data);
    }

    // Clean config for test
    if (existsSync(CONFIG_FILE)) unlinkSync(CONFIG_FILE);

    // Reset module cache AND internal config path cache
    vi.resetModules();
    const config = await import('../config');
    config._resetConfigPaths();
    loadConfig = config.loadConfig;
    saveConfig = config.saveConfig;
    updateConfig = config.updateConfig;
  });

  afterEach(() => {
    // Restore backup
    if (existsSync(BACKUP_FILE)) {
      const data = readFileSync(BACKUP_FILE, 'utf-8');
      writeFileSync(CONFIG_FILE, data);
      unlinkSync(BACKUP_FILE);
    } else if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE);
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
      mkdirSync(CONFIG_DIR, { recursive: true });
      writeFileSync(CONFIG_FILE, JSON.stringify({
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
      mkdirSync(CONFIG_DIR, { recursive: true });
      writeFileSync(CONFIG_FILE, JSON.stringify({
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

      expect(existsSync(CONFIG_DIR)).toBe(true);
      expect(existsSync(CONFIG_FILE)).toBe(true);
    });

    it('writes config as JSON', () => {
      saveConfig({ baseUrl: 'http://test:8080', apiKey: 'key123', outputFormat: 'json' });

      const raw = readFileSync(CONFIG_FILE, 'utf-8');
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
