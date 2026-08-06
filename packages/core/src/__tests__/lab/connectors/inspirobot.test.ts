// InspiroBot — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/inspirobot';

const config: ConnectorTestConfig = {
  connectorId: 'test-inspirobot',
  connectorType: 'source',
  engine: 'inspirobot',
  config: {
    host: 'https://inspirobot.me/api',
  },
  testTables: ['quotes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
