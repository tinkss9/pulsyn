// IP Geolocation — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ip-geolocation';

const config: ConnectorTestConfig = {
  connectorId: 'test-ip-geolocation',
  connectorType: 'source',
  engine: 'ip-geolocation',
  config: { host: 'https://ipapi.co' },
  testTables: ['geo'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
