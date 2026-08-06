// SpongeBob API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/spongebob';

const config: ConnectorTestConfig = {
  connectorId: 'test-spongebob',
  connectorType: 'source',
  engine: 'spongebob',
  config: {
    host: 'https://spongebob-api.glitch.me',
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
