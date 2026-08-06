// Azure Status — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/azure-status';

const config: ConnectorTestConfig = {
  connectorId: 'test-azure-status',
  connectorType: 'source',
  engine: 'azure-status',
  config: { host: 'https://azure.status.microsoft/en-us' },
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
