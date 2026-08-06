// Product Hunt — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/producthunt';

const config: ConnectorTestConfig = {
  connectorId: 'test-producthunt',
  connectorType: 'source',
  engine: 'producthunt',
  config: { host: 'https://www.producthunt.com/frontend/graphql' },
  testTables: ['posts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
