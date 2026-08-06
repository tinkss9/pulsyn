// OpenFDA — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/openfda';

const config: ConnectorTestConfig = {
  connectorId: 'test-openfda',
  connectorType: 'source',
  engine: 'openfda',
  config: {
    host: 'https://api.fda.gov',
  },
  testTables: ['drugs', 'foods'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
