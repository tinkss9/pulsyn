// reynolds-reynolds Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reynolds-reynolds';

const config: ConnectorTestConfig = {
  connectorId: 'test-reynolds-reynolds',
  connectorType: 'source',
  engine: 'reynolds-reynolds',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
