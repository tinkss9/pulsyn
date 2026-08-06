// Datadog API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/datadog-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-datadog-api',
  connectorType: 'source',
  engine: 'datadog-api',
  config: { host: 'https://api.datadoghq.com/api/v1' },
  testTables: ['monitors'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
