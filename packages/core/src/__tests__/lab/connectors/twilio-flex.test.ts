// twilio-flex Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twilio-flex';

const config: ConnectorTestConfig = {
  connectorId: 'test-twilio-flex',
  connectorType: 'source',
  engine: 'twilio-flex',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
