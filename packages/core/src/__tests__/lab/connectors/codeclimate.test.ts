// codeclimate Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/codeclimate';

const config: ConnectorTestConfig = {
  connectorId: 'test-codeclimate',
  connectorType: 'source',
  engine: 'codeclimate',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
