// Twilio API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twilio-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-twilio-real',
  connectorType: 'source',
  engine: 'twilio-real',
  config: { host: 'https://api.twilio.com/2010-04-01' },
  testTables: ['messages', 'calls', 'recordings'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
