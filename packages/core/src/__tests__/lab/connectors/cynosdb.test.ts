// Tencent CynosDB — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cynosdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-cynosdb',
  connectorType: 'source',
  engine: 'cynosdb',
  config: { host: 'https://cynosdb.tencentcloudapi.com' },
  testTables: ['clusters'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
