// Amplitude API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/amplitude-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-amplitude-api',
  connectorType: 'source',
  engine: 'amplitude-api',
  config: { host: 'https://amplitude.com/api/2' },
  testTables: ['events'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
