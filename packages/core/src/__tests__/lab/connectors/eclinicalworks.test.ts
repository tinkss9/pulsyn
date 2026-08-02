// eclinicalworks Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/eclinicalworks';

const config: ConnectorTestConfig = {
  connectorId: 'test-eclinicalworks',
  connectorType: 'source',
  engine: 'eclinicalworks',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
