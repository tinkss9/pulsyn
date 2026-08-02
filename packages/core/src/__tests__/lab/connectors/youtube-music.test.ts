// youtube-music Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/youtube-music';

const config: ConnectorTestConfig = {
  connectorId: 'test-youtube-music',
  connectorType: 'source',
  engine: 'youtube-music',
  config: { /* TODO: Add API credentials */ },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
