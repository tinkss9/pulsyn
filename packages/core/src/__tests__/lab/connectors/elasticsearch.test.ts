// Elasticsearch Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/elasticsearch';

const config: ConnectorTestConfig = {
  connectorId: 'test-elasticsearch',
  connectorType: 'source',
  engine: 'elasticsearch',
  config: {
    host: process.env.TEST_ELASTICSEARCH_HOST || 'http://localhost:9200',
    port: parseInt(process.env.TEST_ELASTICSEARCH_PORT || '9200'),
    database: process.env.TEST_ELASTICSEARCH_DB || 'indices',
    user: process.env.TEST_ELASTICSEARCH_USER || '',
    username: process.env.TEST_ELASTICSEARCH_USER || '',
    password: process.env.TEST_ELASTICSEARCH_PASS || '',
    ssl: false,
    watermarkColumn: 'created_at',
  },
  testTables: ['indices'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
