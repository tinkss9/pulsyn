// @ts-nocheck
// Gumroad Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/products',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'price', type: 'number', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('gumroad')
export class GumroadConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gumroad', 'gumroad', config, {
      baseUrl: config.host || 'https://api.gumroad.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/product',
      
    });
  }
}
