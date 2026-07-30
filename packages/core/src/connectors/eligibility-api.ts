// @ts-nocheck
// Eligibility API Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'checks',
    endpoint: '/eligibility',
    schema: {
      name: 'checks',
      table: 'checks',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('eligibility-api')
export class EligibilityAPIConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'eligibility-api', 'eligibility-api', config, {
      baseUrl: config.host || 'https://api.eligibility.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/eligibility',
      
    });
  }
}
