// QR Server — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/qrserver';

const config: ConnectorTestConfig = {
  connectorId: 'test-qrserver',
  connectorType: 'source',
  engine: 'qrserver',
  config: {
    host: 'https://api.qrserver.com/v1',
  },
  testTables: ['qr'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
