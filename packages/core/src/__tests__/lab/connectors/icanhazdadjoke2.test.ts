// ICanHazDadJoke v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/icanhazdadjoke2';

const config: ConnectorTestConfig = {
  connectorId: 'test-icanhazdadjoke2',
  connectorType: 'source',
  engine: 'icanhazdadjoke2',
  config: { host: 'https://icanhazdadjoke.com' },
  testTables: ['jokes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
