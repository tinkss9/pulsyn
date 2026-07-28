// GitHub Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/github';

const config: ConnectorTestConfig = {
  connectorId: 'test-github',
  connectorType: 'source',
  engine: 'github',
  config: {
    host: 'api.github.com',
    port: 443,
    database: '',
    username: '',
    password: '',
    token: process.env.TEST_GITHUB_TOKEN || '',
    owner: process.env.TEST_GITHUB_OWNER || '',
    repo: process.env.TEST_GITHUB_REPO || '',
    ssl: true,
  } as any,
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
