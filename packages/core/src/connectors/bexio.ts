// @ts-nocheck
// Bexio Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contact',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name_1', type: 'string', nullable: true },
      { name: 'name_2', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('bexio')
export class BexioConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bexio', 'bexio', config, {
      baseUrl: config.host || 'https://api.bexio.com/2.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/contact',
      
    });
  }
}
