// PyPI — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pypi';

const config: ConnectorTestConfig = {
  connectorId: 'test-pypi',
  connectorType: 'source',
  engine: 'pypi',
  config: {
    host: 'https://pypi.org/pypi',
  },
  testTables: ['package'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
