// infor-mfg Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/infor-mfg';

const config: ConnectorTestConfig = {
  connectorId: 'test-infor-mfg',
  connectorType: 'source',
  engine: 'infor-mfg',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
