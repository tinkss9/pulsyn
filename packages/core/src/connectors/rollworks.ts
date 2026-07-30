// @ts-nocheck
// RollWorks Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'domain', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('rollworks')
export class RollWorksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rollworks', 'rollworks', config, {
      baseUrl: config.host || 'https://api.rollworks.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/account',
      
    });
  }
}
