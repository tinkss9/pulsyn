// PlaceBear — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/placebear';

const config: ConnectorTestConfig = {
  connectorId: 'test-placebear',
  connectorType: 'source',
  engine: 'placebear',
  config: {
    host: 'https://placebear.com',
  },
  testTables: ['images'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
