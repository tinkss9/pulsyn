// Public APIs Directory — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/publicapis';

const config: ConnectorTestConfig = {
  connectorId: 'test-publicapis',
  connectorType: 'source',
  engine: 'publicapis',
  config: {
    host: 'https://api.publicapis.org',
  },
  testTables: ['entries'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
