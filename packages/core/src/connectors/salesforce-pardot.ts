// @ts-nocheck
// Salesforce Pardot Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'prospects',
    endpoint: '/v4/prospects',
    schema: {
      name: 'prospects',
      table: 'prospects',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('salesforce-pardot')
export class SalesforcePardotConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'salesforce-pardot', 'salesforce-pardot', config, {
      baseUrl: config.host || 'https://pi.pardot.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v4/prospect/version',
      
    });
  }
}
