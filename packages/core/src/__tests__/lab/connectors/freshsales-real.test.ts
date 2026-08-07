// Freshsales API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/freshsales-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-freshsales-real',
  connectorType: 'source',
  engine: 'freshsales-real',
  config: { host: 'https://{domain}.freshsales.io/api' },
  testTables: ['contacts', 'accounts', 'deals'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
