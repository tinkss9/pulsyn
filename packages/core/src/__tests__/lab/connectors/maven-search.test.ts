// Maven Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/maven-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-maven-search',
  connectorType: 'source',
  engine: 'maven-search',
  config: { host: 'https://search.maven.org/solrsearch/select' },
  testTables: ['artifacts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
