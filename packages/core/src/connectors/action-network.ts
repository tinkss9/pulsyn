// @ts-nocheck
// Action Network Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'people',
    endpoint: '/people',
    schema: {
      name: 'people',
      table: 'people',
      columns: [
      { name: 'identifiers', type: 'object', nullable: false, primaryKey: true },
      { name: 'given_name', type: 'string', nullable: true },
      { name: 'family_name', type: 'string', nullable: true },
      { name: 'email_addresses', type: 'object', nullable: true },
      ],
      primaryKey: ['identifiers'],
    },
    idField: 'identifiers',
    
  },
];

@registerSource('action-network')
export class ActionNetworkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'action-network', 'action-network', config, {
      baseUrl: config.host || 'https://actionnetwork.org/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/people',
      
    });
  }
}
