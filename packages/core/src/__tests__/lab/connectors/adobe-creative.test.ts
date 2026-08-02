// adobe-creative Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/adobe-creative';

const config: ConnectorTestConfig = {
  connectorId: 'test-adobe-creative',
  connectorType: 'source',
  engine: 'adobe-creative',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
