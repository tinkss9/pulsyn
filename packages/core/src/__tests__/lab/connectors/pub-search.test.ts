// Pub.dev Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pub-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-pub-search',
  connectorType: 'source',
  engine: 'pub-search',
  config: { host: 'https://pub.dev/api' },
  testTables: ['packages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
