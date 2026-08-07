// BambooHR API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bamboohr-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-bamboohr-real',
  connectorType: 'source',
  engine: 'bamboohr-real',
  config: { host: 'https://api.bamboohr.com/api/gateway.php/{company}' },
  testTables: ['employees', 'time_off', 'training'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
