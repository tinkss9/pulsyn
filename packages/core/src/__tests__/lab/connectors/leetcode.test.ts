// LeetCode GraphQL — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/leetcode';

const config: ConnectorTestConfig = {
  connectorId: 'test-leetcode',
  connectorType: 'source',
  engine: 'leetcode',
  config: {
    host: 'https://leetcode.com/graphql',
  },
  testTables: ['problems'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
