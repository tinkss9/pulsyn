// Forismatic Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/forismatic';

const config: ConnectorTestConfig = {
  connectorId: 'test-forismatic',
  connectorType: 'source',
  engine: 'forismatic',
  config: {
    host: 'https://api.forismatic.com/api/1.0',
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
