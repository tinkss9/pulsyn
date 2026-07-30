// @ts-nocheck
// Square Connector — Auto-generated from config
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
      { name: 'amount', type: 'object', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('square')
export class SquareConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'square', 'square', config, {
      baseUrl: config.host || 'https://connect.squareup.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/locations',
      
    });
  }
}
