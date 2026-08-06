// ProPublica Congress — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/congress';

const config: ConnectorTestConfig = {
  connectorId: 'test-congress',
  connectorType: 'source',
  engine: 'congress',
  config: {
    host: 'https://api.propublica.org/congress/v1',
  },
  testTables: ['members'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
