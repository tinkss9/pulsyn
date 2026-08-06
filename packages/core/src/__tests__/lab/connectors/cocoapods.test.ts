// CocoaPods — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cocoapods';

const config: ConnectorTestConfig = {
  connectorId: 'test-cocoapods',
  connectorType: 'source',
  engine: 'cocoapods',
  config: {
    host: 'https://trunk.cocoapods.org/api/v1',
  },
  testTables: ['pods'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
