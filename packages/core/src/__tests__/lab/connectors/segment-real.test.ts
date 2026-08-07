// Segment API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/segment-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-segment-real',
  connectorType: 'source',
  engine: 'segment-real',
  config: { host: 'https://platform.segmentapis.com/v1beta' },
  testTables: ['sources', 'destinations', 'tracking_plans'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
