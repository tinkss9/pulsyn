// Library of Congress — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/loc';

const config: ConnectorTestConfig = {
  connectorId: 'test-loc',
  connectorType: 'source',
  engine: 'loc',
  config: {
    host: 'https://www.loc.gov',
  },
  testTables: ['books'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
