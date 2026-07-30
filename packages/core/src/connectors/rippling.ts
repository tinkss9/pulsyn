// @ts-nocheck
// Rippling Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'employees',
    endpoint: '/platform/api/employees',
    schema: {
      name: 'employees',
      table: 'employees',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('rippling')
export class RipplingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rippling', 'rippling', config, {
      baseUrl: config.host || 'https://api.rippling.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/platform/api/me',
      
    });
  }
}
