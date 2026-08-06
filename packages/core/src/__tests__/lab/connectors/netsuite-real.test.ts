// NetSuite — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/netsuite-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-netsuite-real',
  connectorType: 'source',
  engine: 'netsuite-real',
  config: { host: 'https://{account}.suitetalk.api.netsuite.com/services/rest/record/v1' },
  testTables: ['customer', 'salesOrder', 'invoice'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
