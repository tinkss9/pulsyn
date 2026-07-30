// @ts-nocheck
// Infusionsoft Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'given_name', type: 'string', nullable: true },
      { name: 'family_name', type: 'string', nullable: true },
      { name: 'email_addresses', type: 'object', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('infusionsoft')
export class InfusionsoftConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'infusionsoft', 'infusionsoft', config, {
      baseUrl: config.host || 'https://api.infusionsoft.com/crm/rest',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/oauth/connect',
      
    });
  }
}
