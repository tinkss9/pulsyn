// splunk-iot Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/splunk-iot';

const config: ConnectorTestConfig = {
  connectorId: 'test-splunk-iot',
  connectorType: 'source',
  engine: 'splunk-iot',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
