// Gutendex v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gutendex2';

const config: ConnectorTestConfig = {
  connectorId: 'test-gutendex2',
  connectorType: 'source',
  engine: 'gutendex2',
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
