// Image JPEG — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/image-jpeg';

const config: ConnectorTestConfig = {
  connectorId: 'test-image-jpeg',
  connectorType: 'source',
  engine: 'image-jpeg',
  config: { host: 'https://httpbin.org' },
  testTables: ['image'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
