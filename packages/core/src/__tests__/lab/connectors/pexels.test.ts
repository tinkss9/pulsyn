// Pexels — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pexels';

const config: ConnectorTestConfig = {
  connectorId: 'test-pexels',
  connectorType: 'source',
  engine: 'pexels',
  config: {
    host: 'https://api.pexels.com/v1',
  },
  testTables: ['photos'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
