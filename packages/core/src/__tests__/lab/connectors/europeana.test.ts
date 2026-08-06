// Europeana — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/europeana';

const config: ConnectorTestConfig = {
  connectorId: 'test-europeana',
  connectorType: 'source',
  engine: 'europeana',
  config: {
    host: 'https://api.europeana.eu/record/v2',
  },
  testTables: ['search'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
