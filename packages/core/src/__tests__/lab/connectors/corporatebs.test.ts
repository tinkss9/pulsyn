// Corporate BS — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/corporatebs';

const config: ConnectorTestConfig = {
  connectorId: 'test-corporatebs',
  connectorType: 'source',
  engine: 'corporatebs',
  config: {
    host: 'https://corporatebs-generator.sameerkumar.website',
  },
  testTables: ['phrases'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
