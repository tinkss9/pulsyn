// Pub.dev (Dart) — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pub-dev';

const config: ConnectorTestConfig = {
  connectorId: 'test-pub-dev',
  connectorType: 'source',
  engine: 'pub-dev',
  config: { host: 'https://pub.dev/api' },
  testTables: ['packages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
