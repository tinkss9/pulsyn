// Segment API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/segment-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-segment-api',
  connectorType: 'source',
  engine: 'segment-api',
  config: { host: 'https://platform.segmentapis.com/v1beta' },
  testTables: ['sources'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
