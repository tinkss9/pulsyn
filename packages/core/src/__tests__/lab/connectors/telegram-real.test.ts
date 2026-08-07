// Telegram Bot API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/telegram-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-telegram-real',
  connectorType: 'source',
  engine: 'telegram-real',
  config: { host: 'https://api.telegram.org/bot{token}' },
  testTables: ['updates', 'messages', 'chats'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
