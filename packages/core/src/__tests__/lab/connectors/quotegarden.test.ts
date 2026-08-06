// Quote Garden — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/quotegarden';

const config: ConnectorTestConfig = {
  connectorId: 'test-quotegarden',
  connectorType: 'source',
  engine: 'quotegarden',
  config: {
    host: 'https://quotegarden.herokuapp.com/api/v3',
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
