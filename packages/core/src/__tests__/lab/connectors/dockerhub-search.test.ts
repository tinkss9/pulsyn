// Docker Hub Search — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dockerhub-search';

const config: ConnectorTestConfig = {
  connectorId: 'test-dockerhub-search',
  connectorType: 'source',
  engine: 'dockerhub-search',
  config: { host: 'https://hub.docker.com/v2' },
  testTables: ['repositories'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
