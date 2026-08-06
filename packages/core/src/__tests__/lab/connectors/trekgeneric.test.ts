// Star Trek API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/trekgeneric';

const config: ConnectorTestConfig = {
  connectorId: 'test-trekgeneric',
  connectorType: 'source',
  engine: 'trekgeneric',
  config: {
    host: 'https://stapi.co/api/v1/rest',
  },
  testTables: ['species'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
