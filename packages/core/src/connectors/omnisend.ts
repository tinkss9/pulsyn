// @ts-nocheck
// Omnisend Connector — Auto-generated from config
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
      { name: 'contactID', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['contactID'],
    },
    idField: 'contactID',
    
  },
];

@registerSource('omnisend')
export class OmnisendConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'omnisend', 'omnisend', config, {
      baseUrl: config.host || 'https://api.omnisend.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/contacts',
      
    });
  }
}
