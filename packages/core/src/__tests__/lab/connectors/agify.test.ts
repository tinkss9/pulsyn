// Agify — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/agify';

const config: ConnectorTestConfig = {
  connectorId: 'test-agify',
  connectorType: 'source',
  engine: 'agify',
  config: {
    host: 'https://api.agify.io',
  },
  testTables: ['predictions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
