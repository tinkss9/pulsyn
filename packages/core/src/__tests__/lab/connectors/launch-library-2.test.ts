// Launch Library 2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/launch-library-2';

const config: ConnectorTestConfig = {
  connectorId: 'test-launch-library-2',
  connectorType: 'source',
  engine: 'launch-library-2',
  config: { host: 'https://ll.thespacedevs.com/2.2.0' },
  testTables: ['launches'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
