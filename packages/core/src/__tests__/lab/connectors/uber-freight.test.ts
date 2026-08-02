// uber-freight Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/uber-freight';

const config: ConnectorTestConfig = {
  connectorId: 'test-uber-freight',
  connectorType: 'source',
  engine: 'uber-freight',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
