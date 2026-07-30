// @ts-nocheck
// Wodify Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'athletes',
    endpoint: '/athletes',
    schema: {
      name: 'athletes',
      table: 'athletes',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('wodify')
export class WodifyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wodify', 'wodify', config, {
      baseUrl: config.host || 'https://api.wodify.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/athletes',
      
    });
  }
}
