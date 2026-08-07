// Datadog API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/datadog-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-datadog-real',
  connectorType: 'source',
  engine: 'datadog-real',
  config: { host: 'https://api.datadoghq.com/api/v1' },
  testTables: ['monitors', 'dashboards', 'events'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
