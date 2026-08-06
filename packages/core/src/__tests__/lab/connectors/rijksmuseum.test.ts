// Rijksmuseum — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/rijksmuseum';

const config: ConnectorTestConfig = {
  connectorId: 'test-rijksmuseum',
  connectorType: 'source',
  engine: 'rijksmuseum',
  config: {
    host: 'https://www.rijksmuseum.nl/api/en',
  },
  testTables: ['artworks'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
