// PyPI Trending — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pypi-trending';

const config: ConnectorTestConfig = {
  connectorId: 'test-pypi-trending',
  connectorType: 'source',
  engine: 'pypi-trending',
  config: { host: 'https://hugovk.github.io/top-pypi-packages' },
  testTables: ['top'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
