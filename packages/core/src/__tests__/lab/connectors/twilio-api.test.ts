// Twilio API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/twilio-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-twilio-api',
  connectorType: 'source',
  engine: 'twilio-api',
  config: { host: 'https://api.twilio.com/2010-04-01' },
  testTables: ['messages', 'calls'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
