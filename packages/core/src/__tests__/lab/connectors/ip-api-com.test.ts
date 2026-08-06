// ip-api.com — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ip-api-com';

const config: ConnectorTestConfig = {
  connectorId: 'test-ip-api-com',
  connectorType: 'source',
  engine: 'ip-api-com',
  config: { host: 'http://ip-api.com' },
  testTables: ['ip'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
