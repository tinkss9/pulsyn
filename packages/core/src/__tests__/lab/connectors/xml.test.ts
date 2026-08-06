// XML Page — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/xml';

const config: ConnectorTestConfig = {
  connectorId: 'test-xml',
  connectorType: 'source',
  engine: 'xml',
  config: { host: 'https://httpbin.org' },
  testTables: ['xml'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
