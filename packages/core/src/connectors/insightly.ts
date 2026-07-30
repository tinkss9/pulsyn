// @ts-nocheck
// Insightly Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/Contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'CONTACT_ID', type: 'number', nullable: false, primaryKey: true },
      { name: 'FIRST_NAME', type: 'string', nullable: true },
      { name: 'LAST_NAME', type: 'string', nullable: false },
      { name: 'EMAIL_ADDRESS', type: 'string', nullable: true },
      ],
      primaryKey: ['CONTACT_ID'],
    },
    idField: 'CONTACT_ID',
    
  },
  {
    name: 'opportunities',
    endpoint: '/Opportunities',
    schema: {
      name: 'opportunities',
      table: 'opportunities',
      columns: [
      { name: 'OPPORTUNITY_ID', type: 'number', nullable: false, primaryKey: true },
      { name: 'OPPORTUNITY_NAME', type: 'string', nullable: false },
      { name: 'AMOUNT', type: 'number', nullable: true },
      ],
      primaryKey: ['OPPORTUNITY_ID'],
    },
    idField: 'OPPORTUNITY_ID',
    
  },
];

@registerSource('insightly')
export class InsightlyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'insightly', 'insightly', config, {
      baseUrl: config.host || 'https://api.insightly.com/v3.1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/Users',
      
    });
  }
}
