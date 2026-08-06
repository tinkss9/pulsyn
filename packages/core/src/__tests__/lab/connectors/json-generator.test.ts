// JSON Generator — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/json-generator';

const config: ConnectorTestConfig = {
  connectorId: 'test-json-generator',
  connectorType: 'source',
  engine: 'json-generator',
  config: { host: 'https://json-generator.com' },
  testTables: ['data'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
