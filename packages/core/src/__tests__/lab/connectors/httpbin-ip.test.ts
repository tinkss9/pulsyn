// HTTPBin IP — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin-ip';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin-ip',
  connectorType: 'source',
  engine: 'httpbin-ip',
  config: { host: 'https://httpbin.org' },
  testTables: ['ip'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
