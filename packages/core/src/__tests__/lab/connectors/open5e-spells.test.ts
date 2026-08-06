// D&D 5e Spells — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/open5e-spells';

const config: ConnectorTestConfig = {
  connectorId: 'test-open5e-spells',
  connectorType: 'source',
  engine: 'open5e-spells',
  config: { host: 'https://api.open5e.com/v1' },
  testTables: ['spells', 'monsters'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
