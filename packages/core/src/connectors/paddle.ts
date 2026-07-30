// @ts-nocheck
// Paddle Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'transactions',
    endpoint: '/transactions',
    schema: {
      name: 'transactions',
      table: 'transactions',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('paddle')
export class PaddleConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'paddle', 'paddle', config, {
      baseUrl: config.host || 'https://api.paddle.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/products',
      
    });
  }
}
