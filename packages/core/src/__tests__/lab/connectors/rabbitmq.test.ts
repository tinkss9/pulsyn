// rabbitmq Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rabbitmq';

const config: ConnectorTestConfig = {
  connectorId: 'test-rabbitmq',
  connectorType: 'source',
  engine: 'rabbitmq',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
