// Tencent Cloud DB — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tencentdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-tencentdb',
  connectorType: 'source',
  engine: 'tencentdb',
  config: { host: 'https://cdb.tencentcloudapi.com' },
  testTables: ['instances', 'databases'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
