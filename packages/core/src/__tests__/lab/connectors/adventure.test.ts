// Adventure Time API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/adventure';

const config: ConnectorTestConfig = {
  connectorId: 'test-adventure',
  connectorType: 'source',
  engine: 'adventure',
  config: {
    host: 'https://adventure-time-api.herokuapp.com/api/v1',
  },
  testTables: ['characters'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
