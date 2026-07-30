// @ts-nocheck
// Eloqua Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/rest/2.0/data/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'emailAddress', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      { name: 'updatedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updatedAt',
  },
];

@registerSource('eloqua')
export class EloquaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'eloqua', 'eloqua', config, {
      baseUrl: config.host || 'https://secure.eloqua.com/api',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/rest/2.0/system/user',
      
    });
  }
}
