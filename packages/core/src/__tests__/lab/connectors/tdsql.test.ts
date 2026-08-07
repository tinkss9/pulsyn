// Tencent TDSQL — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tdsql';

const config: ConnectorTestConfig = {
  connectorId: 'test-tdsql',
  connectorType: 'source',
  engine: 'tdsql',
  config: { host: 'https://tdsql.tencentcloudapi.com' },
  testTables: ['instances'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
