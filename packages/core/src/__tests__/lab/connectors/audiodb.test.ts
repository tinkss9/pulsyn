// TheAudioDB — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/audiodb';

const config: ConnectorTestConfig = {
  connectorId: 'test-audiodb',
  connectorType: 'source',
  engine: 'audiodb',
  config: {
    host: 'https://www.theaudiodb.com/api/v1/json/2',
  },
  testTables: ['artists'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
