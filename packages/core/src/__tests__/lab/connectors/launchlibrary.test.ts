// Launch Library — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/launchlibrary';

const config: ConnectorTestConfig = {
  connectorId: 'test-launchlibrary',
  connectorType: 'source',
  engine: 'launchlibrary',
  config: {
    host: 'https://ll.thespacedevs.com/2.2.0',
  },
  testTables: ['launches'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
