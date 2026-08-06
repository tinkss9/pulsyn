// Packagist (PHP) — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/packagist';

const config: ConnectorTestConfig = {
  connectorId: 'test-packagist',
  connectorType: 'source',
  engine: 'packagist',
  config: {
    host: 'https://packagist.org',
  },
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
