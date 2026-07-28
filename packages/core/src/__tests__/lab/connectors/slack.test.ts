// Slack Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/slack';

const config: ConnectorTestConfig = {
  connectorId: 'test-slack',
  connectorType: 'source',
  engine: 'slack',
  config: {
    host: 'slack.com',
    port: 443,
    database: '',
    username: '',
    password: '',
    botToken: process.env.TEST_SLACK_BOT_TOKEN || '',
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
