// twillio-verify Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twillio-verify';

const config: ConnectorTestConfig = {
  connectorId: 'test-twillio-verify',
  connectorType: 'source',
  engine: 'twillio-verify',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
