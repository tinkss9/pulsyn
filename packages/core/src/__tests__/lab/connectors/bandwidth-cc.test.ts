// bandwidth-cc Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bandwidth-cc';

const config: ConnectorTestConfig = {
  connectorId: 'test-bandwidth-cc',
  connectorType: 'source',
  engine: 'bandwidth-cc',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
