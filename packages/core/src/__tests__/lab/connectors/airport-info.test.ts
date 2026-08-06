// Airport Info — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/airport-info';

const config: ConnectorTestConfig = {
  connectorId: 'test-airport-info',
  connectorType: 'source',
  engine: 'airport-info',
  config: {
    host: 'https://airport-info.p.rapidapi.com',
  },
  testTables: ['airports'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
