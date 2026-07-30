// @ts-nocheck
// Kindful Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('kindful')
export class KindfulConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kindful', 'kindful', config, {
      baseUrl: config.host || 'https://api.kindful.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/contacts',
      
    });
  }
}
