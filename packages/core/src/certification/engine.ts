// Certification Engine — runs conformance tests against connectors
// Ported from DMS Replicate src/extractors/connectors/certification/engine.py

export type CertificationLevel = 'not_validated' | 'contract' | 'integration' | 'vendor' | 'production';

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  durationMs: number;
  errorMessage?: string;
  marker: string;
}

export interface CertificationReport {
  connectorId: string;
  connectorName: string;
  levelAchieved: CertificationLevel;
  testResults: TestResult[];
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalTests: number;
  environment: string;
  commitSha: string;
  generatedAt: string;
  capabilities: Record<string, boolean>;
}

// Certification levels and their required test markers
const LEVEL_MARKERS: Record<string, string[]> = {
  contract: ['contract'],
  integration: ['contract', 'integration'],
  vendor: ['contract', 'integration', 'fault', 'security'],
  production: ['contract', 'integration', 'fault', 'security'],
};

// Conformance test definitions per connector
const CONFORMANCE_TESTS: Record<string, Array<{ name: string; marker: string; fn: (connector: any) => Promise<boolean> }>> = {
  _default: [
    // Contract tests (run on all connectors)
    { name: 'connect', marker: 'contract', fn: async (c) => { await c.connect(c.config); return c.isConnected(); } },
    { name: 'disconnect', marker: 'contract', fn: async (c) => { await c.disconnect(); return !c.isConnected(); } },
    { name: 'test_connection', marker: 'contract', fn: async (c) => { await c.connect(c.config); return c.testConnection(); } },
    { name: 'get_tables', marker: 'contract', fn: async (c) => { await c.connect(c.config); const t = await c.getTables(); return Array.isArray(t) && t.length >= 0; } },
    { name: 'get_table_schema', marker: 'contract', fn: async (c) => { await c.connect(c.config); const tables = await c.getTables(); if (tables.length === 0) return true; const s = await c.getTableSchema(tables[0]); return !!s.name && Array.isArray(s.columns); } },
    // Integration tests
    { name: 'extract_full', marker: 'integration', fn: async (c) => { await c.connect(c.config); const tables = await c.getTables(); if (tables.length === 0) return true; const events = await c.extractFull(tables[0]); return Array.isArray(events); } },
    { name: 'extract_incremental', marker: 'integration', fn: async (c) => { await c.connect(c.config); const tables = await c.getTables(); if (tables.length === 0) return true; const events = await c.extractIncremental(tables[0], null); return Array.isArray(events); } },
    // Fault tests
    { name: 'bad_credentials', marker: 'fault', fn: async (c) => { try { await c.connect({ ...c.config, password: 'invalid' }); return false; } catch { return true; } } },
    { name: 'connection_timeout', marker: 'fault', fn: async (c) => { try { await c.connect({ ...c.config, host: '192.0.2.1' }); return false; } catch { return true; } } },
    // Security tests
    { name: 'no_password_exposure', marker: 'security', fn: async (c) => { const schema = await c.getTableSchema('test'); return !JSON.stringify(schema).includes(c.config.password); } },
  ],
};

export class CertificationEngine {
  private connectorId: string;
  private outputDir: string;

  constructor(connectorId: string, outputDir: string = 'data/certification') {
    this.connectorId = connectorId;
    this.outputDir = outputDir;
  }

  async run(connector: any, level: string = 'contract'): Promise<CertificationReport> {
    if (!LEVEL_MARKERS[level]) {
      throw new Error(`Invalid level '${level}'. Must be one of: ${Object.keys(LEVEL_MARKERS).join(', ')}`);
    }

    const markers = LEVEL_MARKERS[level];
    const results: TestResult[] = [];

    // Run conformance tests for each marker
    const tests = CONFORMANCE_TESTS['_default'];
    for (const test of tests) {
      if (!markers.includes(test.marker)) continue;

      const start = Date.now();
      try {
        const passed = await test.fn(connector);
        results.push({
          name: test.name,
          status: passed ? 'passed' : 'failed',
          durationMs: Date.now() - start,
          marker: test.marker,
        });
      } catch (err: any) {
        results.push({
          name: test.name,
          status: 'error',
          durationMs: Date.now() - start,
          errorMessage: err.message,
          marker: test.marker,
        });
      }
    }

    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    return {
      connectorId: this.connectorId,
      connectorName: connector.name || this.connectorId,
      levelAchieved: this.determineLevel(results),
      testResults: results,
      totalPassed: passed,
      totalFailed: failed,
      totalSkipped: skipped,
      totalTests: results.length,
      environment: this.determineEnvironment(level),
      commitSha: '',
      generatedAt: new Date().toISOString(),
      capabilities: {},
    };
  }

  private determineLevel(results: TestResult[]): CertificationLevel {
    if (!results.length) return 'not_validated';

    const byMarker: Record<string, TestResult[]> = {};
    for (const r of results) {
      (byMarker[r.marker] ||= []).push(r);
    }

    const allPass = (marker: string) => {
      const m = byMarker[marker] || [];
      return m.length > 0 && m.every(r => r.status === 'passed' || r.status === 'skipped');
    };

    if (allPass('contract') && allPass('integration') && allPass('fault') && allPass('security')) return 'vendor';
    if (allPass('contract') && allPass('integration')) return 'integration';
    if (allPass('contract')) return 'contract';
    return 'not_validated';
  }

  private determineEnvironment(level: string): string {
    const env: Record<string, string> = {
      contract: 'in-memory (mocked)',
      integration: 'docker-compose (local)',
      vendor: 'vendor sandbox (remote)',
      production: 'production (live)',
    };
    return env[level] || 'unknown';
  }

  static generateMarkdown(report: CertificationReport): string {
    const lines = [
      `# Certification Report: ${report.connectorName}`,
      '',
      `**Connector ID:** ${report.connectorId}`,
      `**Level Achieved:** ${report.levelAchieved}`,
      `**Generated:** ${report.generatedAt}`,
      `**Environment:** ${report.environment}`,
      '',
      '## Summary',
      '',
      '| Metric | Value |',
      '|--------|-------|',
      `| Total Tests | ${report.totalTests} |`,
      `| Passed | ${report.totalPassed} |`,
      `| Failed | ${report.totalFailed} |`,
      `| Skipped | ${report.totalSkipped} |`,
      `| Pass Rate | ${report.totalTests > 0 ? ((report.totalPassed / report.totalTests) * 100).toFixed(1) : 0}% |`,
      '',
      '## Test Results',
      '',
      '| Test | Status | Duration |',
      '|------|--------|----------|',
    ];

    for (const r of report.testResults) {
      const icon = r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : r.status === 'skipped' ? '⏭️' : '💥';
      lines.push(`| ${r.name} | ${icon} ${r.status} | ${r.durationMs}ms |`);
    }

    const failures = report.testResults.filter(r => r.status === 'failed' || r.status === 'error');
    if (failures.length > 0) {
      lines.push('', '## Failures', '');
      for (const r of failures) {
        lines.push(`### ${r.name}`);
        lines.push('```');
        lines.push(r.errorMessage || 'No details available');
        lines.push('```', '');
      }
    }

    return lines.join('\n');
  }
}
