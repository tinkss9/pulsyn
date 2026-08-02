// uxpressia Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/uxpressia';

const config: ConnectorTestConfig = {
  connectorId: 'test-uxpressia',
  connectorType: 'source',
  engine: 'uxpressia',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
