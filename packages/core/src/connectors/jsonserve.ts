// JSONServe — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'data',
    endpoint: '/api/demo',
    schema: {
      name: 'data',
      table: 'data',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('jsonserve')
export class JsonserveConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jsonserve', 'jsonserve', config, {
      baseUrl: config.host || 'https://jsonserve.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/demo',
    });
  }
}
