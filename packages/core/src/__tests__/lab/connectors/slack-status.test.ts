// Slack Status — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/slack-status';

const config: ConnectorTestConfig = {
  connectorId: 'test-slack-status',
  connectorType: 'source',
  engine: 'slack-status',
  config: { host: 'https://status.slack.com/api/v2' },
  testTables: ['status'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
