// Potter API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/potterapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-potterapi',
  connectorType: 'source',
  engine: 'potterapi',
  config: {
    host: 'https://potterapi-fedeperin.vercel.app/en',
  },
  testTables: ['characters', 'spells'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
