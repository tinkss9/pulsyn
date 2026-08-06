// PlaceBeyonce — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/placebeyonce';

const config: ConnectorTestConfig = {
  connectorId: 'test-placebeyonce',
  connectorType: 'source',
  engine: 'placebeyonce',
  config: {
    host: 'https://placebeyonce.com',
  },
  testTables: ['images'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
