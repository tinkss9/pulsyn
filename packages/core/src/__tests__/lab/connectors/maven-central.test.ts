// Maven Central — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/maven-central';

const config: ConnectorTestConfig = {
  connectorId: 'test-maven-central',
  connectorType: 'source',
  engine: 'maven-central',
  config: { host: 'https://search.maven.org/solrsearch/select' },
  testTables: ['artifacts'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
