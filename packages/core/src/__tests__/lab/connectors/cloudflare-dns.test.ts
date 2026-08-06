// Cloudflare DNS — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cloudflare-dns';

const config: ConnectorTestConfig = {
  connectorId: 'test-cloudflare-dns',
  connectorType: 'source',
  engine: 'cloudflare-dns',
  config: {
    host: 'https://cloudflare-dns.com/dns-query',
  },
  testTables: ['resolve'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
