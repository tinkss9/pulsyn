// Twitter/X API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twitter-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-twitter-api',
  connectorType: 'source',
  engine: 'twitter-api',
  config: { host: 'https://api.twitter.com/2' },
  testTables: ['tweets'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
