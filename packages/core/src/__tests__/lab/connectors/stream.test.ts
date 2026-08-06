// Stream Bytes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/stream';

const config: ConnectorTestConfig = {
  connectorId: 'test-stream',
  connectorType: 'source',
  engine: 'stream',
  config: { host: 'https://httpbin.org' },
  testTables: ['stream'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
