// sequoiadb Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sequoiadb';

const config: ConnectorTestConfig = {
  connectorId: 'test-sequoiadb',
  connectorType: 'source',
  engine: 'sequoiadb',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
