// FDA API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/fda';

const config: ConnectorTestConfig = {
  connectorId: 'test-fda',
  connectorType: 'source',
  engine: 'fda',
  config: {
    host: 'https://api.fda.gov',
  },
  testTables: ['drugs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
