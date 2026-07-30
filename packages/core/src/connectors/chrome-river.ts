// @ts-nocheck
// Chrome River Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'expenses',
    endpoint: '/expenses',
    schema: {
      name: 'expenses',
      table: 'expenses',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('chrome-river')
export class ChromeRiverConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'chrome-river', 'chrome-river', config, {
      baseUrl: config.host || 'https://api.chromeriver.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/expenses',
      
    });
  }
}
