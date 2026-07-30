// @ts-nocheck
// Plausible v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'stats',
    endpoint: '/stats/breakdown',
    schema: {
      name: 'stats',
      table: 'stats',
      columns: [
      { name: 'source', type: 'string', nullable: false, primaryKey: true },
      { name: 'visitors', type: 'number', nullable: true },
      ],
      primaryKey: ['source'],
    },
    idField: 'source',
    
  },
];

@registerSource('plausible-v2')
export class Plausiblev2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'plausible-v2', 'plausible-v2', config, {
      baseUrl: config.host || 'https://plausible.io/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/realtime/visitors',
      
    });
  }
}
