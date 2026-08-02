// workday-gov Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/workday-gov';

const config: ConnectorTestConfig = {
  connectorId: 'test-workday-gov',
  connectorType: 'source',
  engine: 'workday-gov',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
