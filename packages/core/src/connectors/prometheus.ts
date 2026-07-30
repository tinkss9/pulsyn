// @ts-nocheck
// Prometheus Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'targets',
    endpoint: '/targets',
    schema: {
      name: 'targets',
      table: 'targets',
      columns: [
      { name: 'scrapeUrl', type: 'string', nullable: false, primaryKey: true },
      { name: 'health', type: 'string', nullable: true },
      { name: 'lastScrape', type: 'datetime', nullable: true },
      ],
      primaryKey: ['scrapeUrl'],
    },
    idField: 'scrapeUrl',
    
  },
];

@registerSource('prometheus')
export class PrometheusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'prometheus', 'prometheus', config, {
      baseUrl: config.host || 'http://localhost:9090/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status/config',
      
    });
  }
}
