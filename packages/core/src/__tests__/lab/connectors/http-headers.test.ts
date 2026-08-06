// HTTP Headers — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/http-headers';

const config: ConnectorTestConfig = {
  connectorId: 'test-http-headers',
  connectorType: 'source',
  engine: 'http-headers',
  config: { host: 'https://httpbin.org' },
  testTables: ['response'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
