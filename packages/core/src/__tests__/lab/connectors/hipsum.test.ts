// Hipster Ipsum — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hipsum';

const config: ConnectorTestConfig = {
  connectorId: 'test-hipsum',
  connectorType: 'source',
  engine: 'hipsum',
  config: { host: 'https://hipsum.co/api' },
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
