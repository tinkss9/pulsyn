// Ghibli API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ghibli2';

const config: ConnectorTestConfig = {
  connectorId: 'test-ghibli2',
  connectorType: 'source',
  engine: 'ghibli2',
  config: {
    host: 'https://ghibliapi.vercel.app',
  },
  testTables: ['films', 'people'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
