// YesNo API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/yesno';

const config: ConnectorTestConfig = {
  connectorId: 'test-yesno',
  connectorType: 'source',
  engine: 'yesno',
  config: { host: 'https://yesno.wtf/api' },
  testTables: ['answers'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
