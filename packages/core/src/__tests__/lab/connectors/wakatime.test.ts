// WakaTime Public — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/wakatime';

const config: ConnectorTestConfig = {
  connectorId: 'test-wakatime',
  connectorType: 'source',
  engine: 'wakatime',
  config: {
    host: 'https://wakatime.com/api/v1',
  },
  testTables: ['leaders'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
