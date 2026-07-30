// @ts-nocheck
// Change Healthcare Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'claims',
    endpoint: '/claims',
    schema: {
      name: 'claims',
      table: 'claims',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'amount', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('change-healthcare')
export class ChangeHealthcareConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'change-healthcare', 'change-healthcare', config, {
      baseUrl: config.host || 'https://api.changehealthcare.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/claims',
      
    });
  }
}
