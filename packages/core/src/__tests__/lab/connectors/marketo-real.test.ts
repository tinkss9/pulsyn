// Marketo — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/marketo-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-marketo-real',
  connectorType: 'source',
  engine: 'marketo-real',
  config: { host: 'https://{instance}.mktorest.com/rest' },
  testTables: ['leads', 'campaigns', 'activities'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
