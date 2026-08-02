// mercado-libre Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mercado-libre';

const config: ConnectorTestConfig = {
  connectorId: 'test-mercado-libre',
  connectorType: 'source',
  engine: 'mercado-libre',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
