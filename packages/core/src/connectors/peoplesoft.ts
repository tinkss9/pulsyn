// @ts-nocheck
// PeopleSoft Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'employees',
    endpoint: '/employees',
    schema: {
      name: 'employees',
      table: 'employees',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('peoplesoft')
export class PeopleSoftConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'peoplesoft', 'peoplesoft', config, {
      baseUrl: config.host || 'https://api.peoplesoft.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/employees',
      
    });
  }
}
