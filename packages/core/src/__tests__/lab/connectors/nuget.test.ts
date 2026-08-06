// NuGet API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nuget';

const config: ConnectorTestConfig = {
  connectorId: 'test-nuget',
  connectorType: 'source',
  engine: 'nuget',
  config: {
    host: 'https://api.nuget.org/v3',
  },
  testTables: ['packages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
