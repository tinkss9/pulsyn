// neon-proxy Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/neon-proxy';

const config: ConnectorTestConfig = {
  connectorId: 'test-neon-proxy',
  connectorType: 'source',
  engine: 'neon-proxy',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
