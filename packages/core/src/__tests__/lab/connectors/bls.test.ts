// Bureau of Labor Stats — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bls';

const config: ConnectorTestConfig = {
  connectorId: 'test-bls',
  connectorType: 'source',
  engine: 'bls',
  config: {
    host: 'https://api.bls.gov/publicAPI/v2',
  },
  testTables: ['series'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
