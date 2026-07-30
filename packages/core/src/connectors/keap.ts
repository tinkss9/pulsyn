// @ts-nocheck
// Keap Connector — Auto-generated from config
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
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('keap')
export class KeapConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'keap', 'keap', config, {
      baseUrl: config.host || 'https://api.infusionsoft.com/crm/rest',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/oauth/connect',
      
    });
  }
}
