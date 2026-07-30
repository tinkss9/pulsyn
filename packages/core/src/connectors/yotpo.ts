// @ts-nocheck
// Yotpo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'reviews',
    endpoint: '/reviews',
    schema: {
      name: 'reviews',
      table: 'reviews',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'score', type: 'number', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('yotpo')
export class YotpoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'yotpo', 'yotpo', config, {
      baseUrl: config.host || 'https://api.yotpo.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/reviews',
      
    });
  }
}
