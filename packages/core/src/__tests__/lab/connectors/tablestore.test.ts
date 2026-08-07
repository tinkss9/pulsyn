// Alibaba TableStore — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/tablestore';

const config: ConnectorTestConfig = {
  connectorId: 'test-tablestore',
  connectorType: 'source',
  engine: 'tablestore',
  config: { host: 'https://{instance}.cn-hangzhou.ots.aliyuncs.com' },
  testTables: ['tables'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
