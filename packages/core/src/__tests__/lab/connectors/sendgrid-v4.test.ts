// sendgrid-v4 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sendgrid-v4';

const config: ConnectorTestConfig = {
  connectorId: 'test-sendgrid-v4',
  connectorType: 'source',
  engine: 'sendgrid-v4',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
