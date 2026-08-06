// Lorem Ipsum — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/lorem';

const config: ConnectorTestConfig = {
  connectorId: 'test-lorem',
  connectorType: 'source',
  engine: 'lorem',
  config: {
    host: 'https://loripsum.net/api',
  },
  testTables: ['text'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
