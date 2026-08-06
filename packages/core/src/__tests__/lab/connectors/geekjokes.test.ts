// Geek Jokes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/geekjokes';

const config: ConnectorTestConfig = {
  connectorId: 'test-geekjokes',
  connectorType: 'source',
  engine: 'geekjokes',
  config: {
    host: 'https://geek-jokes.sameerkumar.website',
  },
  testTables: ['jokes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
