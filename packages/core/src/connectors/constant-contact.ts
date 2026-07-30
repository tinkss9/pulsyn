// @ts-nocheck
// Constant Contact Connector — Auto-generated from config
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
      { name: 'contact_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email_address', type: 'object', nullable: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['contact_id'],
    },
    idField: 'contact_id',
    
  },
];

@registerSource('constant-contact')
export class ConstantContactConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'constant-contact', 'constant-contact', config, {
      baseUrl: config.host || 'https://api.cc.email/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/account/summary',
      
    });
  }
}
