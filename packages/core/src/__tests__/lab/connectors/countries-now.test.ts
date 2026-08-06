// Countries Now — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/countries-now';

const config: ConnectorTestConfig = {
  connectorId: 'test-countries-now',
  connectorType: 'source',
  engine: 'countries-now',
  config: {
    host: 'https://countriesnow.space/api/v0.1',
  },
  testTables: ['countries', 'population'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
