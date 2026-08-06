// HTTP Cookies — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cookies';

const config: ConnectorTestConfig = {
  connectorId: 'test-cookies',
  connectorType: 'source',
  engine: 'cookies',
  config: { host: 'https://httpbin.org' },
  testTables: ['cookies'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
