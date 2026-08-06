// Harvard Art Museums — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/harvardart';

const config: ConnectorTestConfig = {
  connectorId: 'test-harvardart',
  connectorType: 'source',
  engine: 'harvardart',
  config: {
    host: 'https://api.harvardartmuseums.org',
  },
  testTables: ['objects'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
