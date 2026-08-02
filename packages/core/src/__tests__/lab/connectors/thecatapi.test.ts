// The Cat API Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/thecatapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-thecatapi',
  connectorType: 'source',
  engine: 'thecatapi',
  config: {
    host: 'https://api.thecatapi.com',
  },
  testTables: ['breeds'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
