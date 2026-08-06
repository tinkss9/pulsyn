// Reddit Popular — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/reddit-popular';

const config: ConnectorTestConfig = {
  connectorId: 'test-reddit-popular',
  connectorType: 'source',
  engine: 'reddit-popular',
  config: { host: 'https://www.reddit.com' },
  testTables: ['popular'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
