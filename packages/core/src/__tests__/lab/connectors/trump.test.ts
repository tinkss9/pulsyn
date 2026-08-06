// Trump Quotes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/trump';

const config: ConnectorTestConfig = {
  connectorId: 'test-trump',
  connectorType: 'source',
  engine: 'trump',
  config: {
    host: 'https://api.whatdoestrumpthink.com/api/v1',
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
