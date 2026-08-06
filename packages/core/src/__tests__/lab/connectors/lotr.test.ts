// Lord of the Rings API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lotr';

const config: ConnectorTestConfig = {
  connectorId: 'test-lotr',
  connectorType: 'source',
  engine: 'lotr',
  config: {
    host: 'https://the-one-api.dev/v2',
  },
  testTables: ['movie'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
