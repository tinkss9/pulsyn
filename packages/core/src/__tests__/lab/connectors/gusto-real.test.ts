// Gusto API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gusto-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-gusto-real',
  connectorType: 'source',
  engine: 'gusto-real',
  config: { host: 'https://api.gusto.com/v1' },
  testTables: ['companies', 'employees', 'payrolls'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
