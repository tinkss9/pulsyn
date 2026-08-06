// Cleveland Museum of Art — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/clevelandart';

const config: ConnectorTestConfig = {
  connectorId: 'test-clevelandart',
  connectorType: 'source',
  engine: 'clevelandart',
  config: {
    host: 'https://openaccess-api.clevelandart.org/api',
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
