// donorperfect Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/donorperfect';

const config: ConnectorTestConfig = {
  connectorId: 'test-donorperfect',
  connectorType: 'source',
  engine: 'donorperfect',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
