// GCP Status — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gcp-status';

const config: ConnectorTestConfig = {
  connectorId: 'test-gcp-status',
  connectorType: 'source',
  engine: 'gcp-status',
  config: { host: 'https://status.cloud.google.com' },
  testTables: ['status'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
