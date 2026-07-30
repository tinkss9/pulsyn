// @ts-nocheck
// Front Connector — Auto-generated from config
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
      { name: 'subject', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('front')
export class FrontConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'front', 'front', config, {
      baseUrl: config.host || 'https://api2.frontapp.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
