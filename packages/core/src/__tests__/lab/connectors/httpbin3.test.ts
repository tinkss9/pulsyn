// HTTPBin v3 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/httpbin3';

const config: ConnectorTestConfig = {
  connectorId: 'test-httpbin3',
  connectorType: 'source',
  engine: 'httpbin3',
  config: {
    host: 'https://postman-echo.com',
  },
  testTables: ['get'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
