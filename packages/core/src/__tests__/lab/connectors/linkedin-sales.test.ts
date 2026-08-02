// linkedin-sales Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/linkedin-sales';

const config: ConnectorTestConfig = {
  connectorId: 'test-linkedin-sales',
  connectorType: 'source',
  engine: 'linkedin-sales',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
