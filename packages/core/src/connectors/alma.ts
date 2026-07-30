// @ts-nocheck
// Alma Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'payments',
    endpoint: '/payments',
    schema: {
      name: 'payments',
      table: 'payments',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('alma')
export class AlmaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'alma', 'alma', config, {
      baseUrl: config.host || 'https://api.getalma.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/merchants',
      
    });
  }
}
