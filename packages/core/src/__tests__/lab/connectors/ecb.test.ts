// European Central Bank — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/ecb';

const config: ConnectorTestConfig = {
  connectorId: 'test-ecb',
  connectorType: 'source',
  engine: 'ecb',
  config: {
    host: 'https://data-api.ecb.europa.eu/service/data',
  },
  testTables: ['exchange_rates'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
