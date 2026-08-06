// Go Packages — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/go-pkg';

const config: ConnectorTestConfig = {
  connectorId: 'test-go-pkg',
  connectorType: 'source',
  engine: 'go-pkg',
  config: { host: 'https://proxy.golang.org' },
  testTables: ['versions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
