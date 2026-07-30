// @ts-nocheck
// Jenzabar Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'students',
    endpoint: '/students',
    schema: {
      name: 'students',
      table: 'students',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('jenzabar')
export class JenzabarConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jenzabar', 'jenzabar', config, {
      baseUrl: config.host || 'https://api.jenzabar.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/students',
      
    });
  }
}
