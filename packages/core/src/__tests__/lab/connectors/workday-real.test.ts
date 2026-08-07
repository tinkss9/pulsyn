// Workday REST API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/workday-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-workday-real',
  connectorType: 'source',
  engine: 'workday-real',
  config: { host: 'https://{tenant}.workday.com/ccx/api/v1' },
  testTables: ['workers', 'positions', 'jobs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
