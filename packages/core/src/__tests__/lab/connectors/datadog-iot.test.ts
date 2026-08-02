// datadog-iot Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/datadog-iot';

const config: ConnectorTestConfig = {
  connectorId: 'test-datadog-iot',
  connectorType: 'source',
  engine: 'datadog-iot',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
