// Dad Jokes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dadjokes';

const config: ConnectorTestConfig = {
  connectorId: 'test-dadjokes',
  connectorType: 'source',
  engine: 'dadjokes',
  config: {
    host: 'https://icanhazdadjoke.com',
  },
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
