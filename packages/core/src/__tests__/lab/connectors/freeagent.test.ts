// freeagent Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/freeagent';

const config: ConnectorTestConfig = {
  connectorId: 'test-freeagent',
  connectorType: 'source',
  engine: 'freeagent',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
