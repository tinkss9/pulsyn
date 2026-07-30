// @ts-nocheck
// GoHighLevel Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contacts/',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'dateAdded', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('gohighlevel')
export class GoHighLevelConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gohighlevel', 'gohighlevel', config, {
      baseUrl: config.host || 'https://rest.gohighlevel.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/contacts/',
      
    });
  }
}
