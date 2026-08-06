// Bacon Ipsum — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bacon';

const config: ConnectorTestConfig = {
  connectorId: 'test-bacon',
  connectorType: 'source',
  engine: 'bacon',
  config: {
    host: 'https://baconipsum.com/api',
  },
  testTables: ['meat'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
