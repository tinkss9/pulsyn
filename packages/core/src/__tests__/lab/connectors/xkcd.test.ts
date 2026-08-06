// XKCD Comics — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/xkcd';

const config: ConnectorTestConfig = {
  connectorId: 'test-xkcd',
  connectorType: 'source',
  engine: 'xkcd',
  config: {
    host: 'https://xkcd.com',
  },
  testTables: ['comics'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
