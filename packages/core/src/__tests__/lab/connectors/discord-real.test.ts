// Discord API v10 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/discord-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-discord-real',
  connectorType: 'source',
  engine: 'discord-real',
  config: { host: 'https://discord.com/api/v10' },
  testTables: ['guilds', 'channels', 'messages'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
