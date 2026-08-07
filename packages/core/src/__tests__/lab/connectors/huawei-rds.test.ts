// Huawei Cloud RDS — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/huawei-rds';

const config: ConnectorTestConfig = {
  connectorId: 'test-huawei-rds',
  connectorType: 'source',
  engine: 'huawei-rds',
  config: { host: 'https://rds.cn-north-4.myhuaweicloud.com/v3' },
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
