// cloudflare-stream Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cloudflare-stream';

const config: ConnectorTestConfig = {
  connectorId: 'test-cloudflare-stream',
  connectorType: 'source',
  engine: 'cloudflare-stream',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
