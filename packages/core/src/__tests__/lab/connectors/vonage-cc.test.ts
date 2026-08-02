// vonage-cc Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/vonage-cc';

const config: ConnectorTestConfig = {
  connectorId: 'test-vonage-cc',
  connectorType: 'source',
  engine: 'vonage-cc',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
