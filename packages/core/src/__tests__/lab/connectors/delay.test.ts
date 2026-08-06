// HTTP Delay — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/delay';

const config: ConnectorTestConfig = {
  connectorId: 'test-delay',
  connectorType: 'source',
  engine: 'delay',
  config: { host: 'https://httpbin.org' },
  testTables: ['delay'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
