// @ts-nocheck
// Beehiiv Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscriptions',
    endpoint: '/publications/{publicationId}/subscriptions',
    schema: {
      name: 'subscriptions',
      table: 'subscriptions',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('beehiiv')
export class BeehiivConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'beehiiv', 'beehiiv', config, {
      baseUrl: config.host || 'https://api.beehiiv.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/publications',
      
    });
  }
}
