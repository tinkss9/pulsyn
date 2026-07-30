// @ts-nocheck
// HappyFox Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tickets',
    endpoint: '/tickets',
    schema: {
      name: 'tickets',
      table: 'tickets',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('happyfox')
export class HappyFoxConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'happyfox', 'happyfox', config, {
      baseUrl: config.host || 'https://your-account.happyfox.com/api/1.1/json',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/contacts',
      
    });
  }
}
