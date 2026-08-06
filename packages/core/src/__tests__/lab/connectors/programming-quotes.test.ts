// Programming Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/programming-quotes';

const config: ConnectorTestConfig = {
  connectorId: 'test-programming-quotes',
  connectorType: 'source',
  engine: 'programming-quotes',
  config: {
    host: 'https://programming-quotes-api.azurewebsites.net/api',
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
