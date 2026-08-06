// Gutenberg API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gutendex';

const config: ConnectorTestConfig = {
  connectorId: 'test-gutendex',
  connectorType: 'source',
  engine: 'gutendex',
  config: {
    host: 'https://gutendex.com',
  },
  testTables: ['books'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
