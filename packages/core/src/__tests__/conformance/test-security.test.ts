import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseConnector } from '../../connectors/base';
import { ConnectorRegistry } from '../../connectors/registry';
import { getTestConnector, TEST_CONFIG } from './conftest';

describe('Security Conformance', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not leak secrets in console output', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const connector = getTestConnector();

    try {
      await connector.connect();
    } catch {
      // connection may fail in test — we only care about log output
    }

    const allLogs = [
      ...logSpy.mock.calls.map((args) => args.join(' ')),
      ...warnSpy.mock.calls.map((args) => args.join(' ')),
      ...errorSpy.mock.calls.map((args) => args.join(' ')),
    ];

    for (const logLine of allLogs) {
      expect(logLine).not.toContain(TEST_CONFIG.password);
      expect(logLine).not.toContain('testpass');
    }
  });

  it('should mask sensitive fields in config representation', () => {
    const connector = ConnectorRegistry.getSource('postgresql', 'mask-id', {
      ...TEST_CONFIG,
      password: 'super_secret_password_123',
    });

    const configStr = JSON.stringify(connector.getConfig());

    expect(configStr).not.toContain('super_secret_password_123');
    // Password should be masked with asterisks or redacted
    expect(
      configStr.includes('***') || configStr.includes('[REDACTED]') || !configStr.includes('password')
    ).toBe(true);
  });

  it('should respect TLS configuration', () => {
    const connector = ConnectorRegistry.getSource('postgresql', 'tls-id', {
      ...TEST_CONFIG,
      ssl: true,
      sslMode: 'verify-full',
      sslCert: '/path/to/cert.pem',
      sslKey: '/path/to/key.pem',
      sslRootCert: '/path/to/ca.pem',
    });

    const config = connector.getConfig();

    expect(config.ssl).toBe(true);
    expect(config.sslMode).toBe('verify-full');
    // Verify TLS paths are preserved (not stripped)
    expect(config.sslCert).toBeDefined();
    expect(config.sslRootCert).toBeDefined();
  });
});
