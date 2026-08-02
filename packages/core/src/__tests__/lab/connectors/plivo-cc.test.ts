// plivo-cc Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/plivo-cc';

const config: ConnectorTestConfig = {
  connectorId: 'test-plivo-cc',
  connectorType: 'source',
  engine: 'plivo-cc',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
