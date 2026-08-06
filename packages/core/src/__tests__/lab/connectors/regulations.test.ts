// Regulations.gov — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/regulations';

const config: ConnectorTestConfig = {
  connectorId: 'test-regulations',
  connectorType: 'source',
  engine: 'regulations',
  config: {
    host: 'https://api.regulations.gov/v4',
  },
  testTables: ['documents'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
