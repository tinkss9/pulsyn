// Twitter Public — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twitter-public';

const config: ConnectorTestConfig = {
  connectorId: 'test-twitter-public',
  connectorType: 'source',
  engine: 'twitter-public',
  config: {
    host: 'https://api.twitter.com/2',
  },
  testTables: ['trends'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
