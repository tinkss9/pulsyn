// FishWatch API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/fishbase';

const config: ConnectorTestConfig = {
  connectorId: 'test-fishbase',
  connectorType: 'source',
  engine: 'fishbase',
  config: {
    host: 'https://www.fishwatch.gov/api',
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
