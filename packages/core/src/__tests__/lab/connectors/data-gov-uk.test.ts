// Data.gov.uk — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/data-gov-uk';

const config: ConnectorTestConfig = {
  connectorId: 'test-data-gov-uk',
  connectorType: 'source',
  engine: 'data-gov-uk',
  config: {
    host: 'https://data.gov.uk/api',
  },
  testTables: ['datasets'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
