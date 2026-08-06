// Packagist Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/packagist-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-packagist-search',
  connectorType: 'source',
  engine: 'packagist-search',
  config: { host: 'https://packagist.org' },
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
