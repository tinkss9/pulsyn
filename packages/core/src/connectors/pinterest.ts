// @ts-nocheck
// Pinterest Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'pins',
    endpoint: '/pins',
    schema: {
      name: 'pins',
      table: 'pins',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'description', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('pinterest')
export class PinterestConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pinterest', 'pinterest', config, {
      baseUrl: config.host || 'https://api.pinterest.com/v5',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user_account',
      
    });
  }
}
