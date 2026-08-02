// airbyte-v2 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/airbyte-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-airbyte-v2',
  connectorType: 'source',
  engine: 'airbyte-v2',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
