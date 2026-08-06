// ip-api.co — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ip-api-co';

const config: ConnectorTestConfig = {
  connectorId: 'test-ip-api-co',
  connectorType: 'source',
  engine: 'ip-api-co',
  config: { host: 'https://ipapi.co' },
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
