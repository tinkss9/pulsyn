// docker-hub Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/docker-hub';

const config: ConnectorTestConfig = {
  connectorId: 'test-docker-hub',
  connectorType: 'source',
  engine: 'docker-hub',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
