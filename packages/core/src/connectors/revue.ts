// @ts-nocheck
// Revue Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscribers',
    endpoint: '/subscribers',
    schema: {
      name: 'subscribers',
      table: 'subscribers',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('revue')
export class RevueConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'revue', 'revue', config, {
      baseUrl: config.host || 'https://www.getrevue.co/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/account',
      
    });
  }
}
