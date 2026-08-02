// messagebird-cc Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/messagebird-cc';

const config: ConnectorTestConfig = {
  connectorId: 'test-messagebird-cc',
  connectorType: 'source',
  engine: 'messagebird-cc',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
