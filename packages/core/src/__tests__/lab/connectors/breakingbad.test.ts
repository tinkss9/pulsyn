// Breaking Bad API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/breakingbad';

const config: ConnectorTestConfig = {
  connectorId: 'test-breakingbad',
  connectorType: 'source',
  engine: 'breakingbad',
  config: {
    host: 'https://www.breakingbadapi.com/api',
  },
  testTables: ['characters', 'episodes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
