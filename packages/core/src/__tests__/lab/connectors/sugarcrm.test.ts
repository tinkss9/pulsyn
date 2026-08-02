// sugarcrm Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sugarcrm';

const config: ConnectorTestConfig = {
  connectorId: 'test-sugarcrm',
  connectorType: 'source',
  engine: 'sugarcrm',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
