// AniList GraphQL — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/aniapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-aniapi',
  connectorType: 'source',
  engine: 'aniapi',
  config: {
    host: 'https://graphql.anilist.co',
  },
  testTables: ['trending'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
