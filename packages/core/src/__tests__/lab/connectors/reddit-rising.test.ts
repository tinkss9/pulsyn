// Reddit Rising — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reddit-rising';

const config: ConnectorTestConfig = {
  connectorId: 'test-reddit-rising',
  connectorType: 'source',
  engine: 'reddit-rising',
  config: { host: 'https://www.reddit.com' },
  testTables: ['rising'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
