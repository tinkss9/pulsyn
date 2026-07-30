// @ts-nocheck
// Recruit Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'candidates',
    endpoint: '/candidates',
    schema: {
      name: 'candidates',
      table: 'candidates',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('recruit')
export class RecruitConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'recruit', 'recruit', config, {
      baseUrl: config.host || 'https://api.recruit.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/candidates',
      
    });
  }
}
