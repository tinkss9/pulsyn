// CPAN (Perl) — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cpan';

const config: ConnectorTestConfig = {
  connectorId: 'test-cpan',
  connectorType: 'source',
  engine: 'cpan',
  config: { host: 'https://fastapi.metacpan.org/v1' },
  testTables: ['modules'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
