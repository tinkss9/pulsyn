// wordpress-com Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wordpress-com';

const config: ConnectorTestConfig = {
  connectorId: 'test-wordpress-com',
  connectorType: 'source',
  engine: 'wordpress-com',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
