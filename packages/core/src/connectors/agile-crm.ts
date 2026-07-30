// @ts-nocheck
// Agile CRM Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/api/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('agile-crm')
export class AgileCRMConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'agile-crm', 'agile-crm', config, {
      baseUrl: config.host || 'https://your-domain.agilecrm.com/rest',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/contacts',
      
    });
  }
}
