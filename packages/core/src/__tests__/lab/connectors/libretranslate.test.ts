// LibreTranslate — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/libretranslate';

const config: ConnectorTestConfig = {
  connectorId: 'test-libretranslate',
  connectorType: 'source',
  engine: 'libretranslate',
  config: {
    host: 'https://libretranslate.com',
  },
  testTables: ['languages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
