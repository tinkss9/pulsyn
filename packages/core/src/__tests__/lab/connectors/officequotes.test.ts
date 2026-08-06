// Office Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/officequotes';

const config: ConnectorTestConfig = {
  connectorId: 'test-officequotes',
  connectorType: 'source',
  engine: 'officequotes',
  config: {
    host: 'https://officeapi.akashrajpurohit.com',
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
