// Hashnode Posts — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hashnode-posts';

const config: ConnectorTestConfig = {
  connectorId: 'test-hashnode-posts',
  connectorType: 'source',
  engine: 'hashnode-posts',
  config: { host: 'https://hashnode.com/api' },
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
