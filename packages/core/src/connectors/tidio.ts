// @ts-nocheck
// Tidio Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'conversations',
    endpoint: '/conversations',
    schema: {
      name: 'conversations',
      table: 'conversations',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('tidio')
export class TidioConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tidio', 'tidio', config, {
      baseUrl: config.host || 'https://api.tidio.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/conversations',
      
    });
  }
}
