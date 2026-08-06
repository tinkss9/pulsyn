// Programming Quotes v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/programming-quotes2';

const config: ConnectorTestConfig = {
  connectorId: 'test-programming-quotes2',
  connectorType: 'source',
  engine: 'programming-quotes2',
  config: { host: 'https://programming-quotes-api-pi.vercel.app/api' },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
