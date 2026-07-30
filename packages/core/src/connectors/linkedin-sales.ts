// @ts-nocheck
// LinkedIn Sales Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leads',
    endpoint: '/leadFormResponses',
    schema: {
      name: 'leads',
      table: 'leads',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'submittedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('linkedin-sales')
export class LinkedInSalesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'linkedin-sales', 'linkedin-sales', config, {
      baseUrl: config.host || 'https://api.linkedin.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
