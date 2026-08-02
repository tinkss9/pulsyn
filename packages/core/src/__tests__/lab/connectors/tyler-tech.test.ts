// tyler-tech Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tyler-tech';

const config: ConnectorTestConfig = {
  connectorId: 'test-tyler-tech',
  connectorType: 'source',
  engine: 'tyler-tech',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
