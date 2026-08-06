// Discord API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/discord-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-discord-api',
  connectorType: 'source',
  engine: 'discord-api',
  config: { host: 'https://discord.com/api/v10' },
  testTables: ['guilds'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
