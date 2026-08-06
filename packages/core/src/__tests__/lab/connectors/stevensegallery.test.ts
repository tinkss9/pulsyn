// Steven Se Gallery — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stevensegallery';

const config: ConnectorTestConfig = {
  connectorId: 'test-stevensegallery',
  connectorType: 'source',
  engine: 'stevensegallery',
  config: {
    host: 'https://stevensegallery.com',
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
