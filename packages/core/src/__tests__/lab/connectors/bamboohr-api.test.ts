// BambooHR API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bamboohr-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-bamboohr-api',
  connectorType: 'source',
  engine: 'bamboohr-api',
  config: { host: 'https://api.bamboohr.com/api/gateway.php/{company}' },
  testTables: ['employees'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
