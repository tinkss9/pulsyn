// Shiba Inu — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/shiba';

const config: ConnectorTestConfig = {
  connectorId: 'test-shiba',
  connectorType: 'source',
  engine: 'shiba',
  config: { host: 'https://shibe.online/api' },
  testTables: ['shibas'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
