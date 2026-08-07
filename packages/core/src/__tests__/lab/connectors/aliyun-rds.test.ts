// Alibaba Cloud RDS — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/aliyun-rds';

const config: ConnectorTestConfig = {
  connectorId: 'test-aliyun-rds',
  connectorType: 'source',
  engine: 'aliyun-rds',
  config: { host: 'https://rds.aliyuncs.com' },
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
