// Linear API (GraphQL) — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/linear-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-linear-real',
  connectorType: 'source',
  engine: 'linear-real',
  config: { host: 'https://api.linear.app/graphql' },
  testTables: ['issues', 'projects', 'teams'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
