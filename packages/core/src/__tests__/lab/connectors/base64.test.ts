// Base64 Decode — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/base64';

const config: ConnectorTestConfig = {
  connectorId: 'test-base64',
  connectorType: 'source',
  engine: 'base64',
  config: { host: 'https://httpbin.org' },
  testTables: ['base64'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
