// when2meet Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/when2meet';

const config: ConnectorTestConfig = {
  connectorId: 'test-when2meet',
  connectorType: 'source',
  engine: 'when2meet',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
