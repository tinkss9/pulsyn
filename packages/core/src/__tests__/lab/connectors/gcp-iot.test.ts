// gcp-iot Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gcp-iot';

const config: ConnectorTestConfig = {
  connectorId: 'test-gcp-iot',
  connectorType: 'source',
  engine: 'gcp-iot',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
