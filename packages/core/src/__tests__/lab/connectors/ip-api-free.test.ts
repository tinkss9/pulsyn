// ip-api Free — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ip-api-free';

const config: ConnectorTestConfig = {
  connectorId: 'test-ip-api-free',
  connectorType: 'source',
  engine: 'ip-api-free',
  config: { host: 'http://ip-api.com' },
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
