// hootsuite Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hootsuite';

const config: ConnectorTestConfig = {
  connectorId: 'test-hootsuite',
  connectorType: 'source',
  engine: 'hootsuite',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
