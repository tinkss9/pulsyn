// Arbeitnow Jobs — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/arbeitnow';

const config: ConnectorTestConfig = {
  connectorId: 'test-arbeitnow',
  connectorType: 'source',
  engine: 'arbeitnow',
  config: {
    host: 'https://www.arbeitnow.com/api',
  },
  testTables: ['jobs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
