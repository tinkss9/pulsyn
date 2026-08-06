// StatusPage.io — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/statuspage-io';

const config: ConnectorTestConfig = {
  connectorId: 'test-statuspage-io',
  connectorType: 'source',
  engine: 'statuspage-io',
  config: { host: 'https://metastatuspage.com' },
  testTables: ['status'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
