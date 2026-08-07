// Copper API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/copper-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-copper-real',
  connectorType: 'source',
  engine: 'copper-real',
  config: { host: 'https://api.copper.com/developer_api/v1' },
  testTables: ['people', 'companies', 'opportunities'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
