// Notion Public Pages — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/notion-public';

const config: ConnectorTestConfig = {
  connectorId: 'test-notion-public',
  connectorType: 'source',
  engine: 'notion-public',
  config: {
    host: 'https://notion-api.splitbee.io/v1',
  },
  testTables: ['table'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
