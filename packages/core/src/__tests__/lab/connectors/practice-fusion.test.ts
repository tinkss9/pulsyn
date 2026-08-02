// practice-fusion Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/practice-fusion';

const config: ConnectorTestConfig = {
  connectorId: 'test-practice-fusion',
  connectorType: 'source',
  engine: 'practice-fusion',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
