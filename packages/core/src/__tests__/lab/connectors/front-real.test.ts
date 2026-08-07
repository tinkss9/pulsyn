// Front API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/front-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-front-real',
  connectorType: 'source',
  engine: 'front-real',
  config: { host: 'https://api2.frontapp.com' },
  testTables: ['conversations', 'contacts', 'messages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
