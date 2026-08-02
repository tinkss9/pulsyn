// storyblok Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/storyblok';

const config: ConnectorTestConfig = {
  connectorId: 'test-storyblok',
  connectorType: 'source',
  engine: 'storyblok',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
