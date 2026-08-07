// Pipedrive API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pipedrive-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-pipedrive-real',
  connectorType: 'source',
  engine: 'pipedrive-real',
  config: { host: 'https://api.pipedrive.com/v2' },
  testTables: ['persons', 'organizations', 'deals'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
