// PyPI Package — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pypi-package';

const config: ConnectorTestConfig = {
  connectorId: 'test-pypi-package',
  connectorType: 'source',
  engine: 'pypi-package',
  config: { host: 'https://pypi.org/pypi' },
  testTables: ['package'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
