// ipapi v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ipapi-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-ipapi-v2',
  connectorType: 'source',
  engine: 'ipapi-v2',
  config: { host: 'https://ipapi.co' },
  testTables: ['json'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
