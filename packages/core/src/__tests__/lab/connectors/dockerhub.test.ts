// Docker Hub — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dockerhub';

const config: ConnectorTestConfig = {
  connectorId: 'test-dockerhub',
  connectorType: 'source',
  engine: 'dockerhub',
  config: {
    host: 'https://hub.docker.com/v2',
  },
  testTables: ['images'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
