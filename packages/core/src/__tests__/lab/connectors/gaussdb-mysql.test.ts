// Huawei GaussDB MySQL — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/gaussdb-mysql';

const config: ConnectorTestConfig = {
  connectorId: 'test-gaussdb-mysql',
  connectorType: 'source',
  engine: 'gaussdb-mysql',
  config: { host: 'https://gaussdb.cn-north-4.myhuaweicloud.com/v3' },
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
