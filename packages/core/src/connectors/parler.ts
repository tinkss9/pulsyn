// @ts-nocheck
// Parler Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/feed',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'body', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('parler')
export class ParlerConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'parler', 'parler', config, {
      baseUrl: config.host || 'https://api.parler.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
