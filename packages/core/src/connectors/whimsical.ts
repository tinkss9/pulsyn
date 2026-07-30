// @ts-nocheck
// Whimsical Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'files',
    endpoint: '/files',
    schema: {
      name: 'files',
      table: 'files',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('whimsical')
export class WhimsicalConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'whimsical', 'whimsical', config, {
      baseUrl: config.host || 'https://api.whimsical.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/files',
      
    });
  }
}
