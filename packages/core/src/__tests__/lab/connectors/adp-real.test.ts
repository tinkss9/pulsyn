// ADP Workforce Now API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/adp-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-adp-real',
  connectorType: 'source',
  engine: 'adp-real',
  config: { host: 'https://api.adp.com' },
  testTables: ['workers', 'payroll', 'time'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
