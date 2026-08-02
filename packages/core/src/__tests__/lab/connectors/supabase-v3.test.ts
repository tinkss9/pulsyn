// supabase-v3 Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/supabase-v3';

const config: ConnectorTestConfig = {
  connectorId: 'test-supabase-v3',
  connectorType: 'source',
  engine: 'supabase-v3',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
