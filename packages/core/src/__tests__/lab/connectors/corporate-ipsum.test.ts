// Corporate Ipsum — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/corporate-ipsum';

const config: ConnectorTestConfig = {
  connectorId: 'test-corporate-ipsum',
  connectorType: 'source',
  engine: 'corporate-ipsum',
  config: { host: 'https://corporateipsum.com' },
  testTables: ['text'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
