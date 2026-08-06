// Telegram Bot API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/telegram-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-telegram-api',
  connectorType: 'source',
  engine: 'telegram-api',
  config: { host: 'https://api.telegram.org/bot{token}' },
  testTables: ['updates'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
