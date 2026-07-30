// @ts-nocheck
// PerfectGym Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'members',
    endpoint: '/members',
    schema: {
      name: 'members',
      table: 'members',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('perfectgym')
export class PerfectGymConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'perfectgym', 'perfectgym', config, {
      baseUrl: config.host || 'https://api.perfectgym.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/members',
      
    });
  }
}
