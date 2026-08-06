// Simpsons Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/simpsons';

const config: ConnectorTestConfig = {
  connectorId: 'test-simpsons',
  connectorType: 'source',
  engine: 'simpsons',
  config: {
    host: 'https://thesimpsonsquoteapi.glitch.me',
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
