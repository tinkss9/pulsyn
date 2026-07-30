// @ts-nocheck
// Wistia Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'medias',
    endpoint: '/medias',
    schema: {
      name: 'medias',
      table: 'medias',
      columns: [
      { name: 'hashed_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['hashed_id'],
    },
    idField: 'hashed_id',
    
  },
];

@registerSource('wistia')
export class WistiaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wistia', 'wistia', config, {
      baseUrl: config.host || 'https://api.wistia.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
