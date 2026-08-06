// Ventura API — Community API (No Auth)
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
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'age', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('ventura')
export class VenturaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ventura', 'ventura', config, {
      baseUrl: config.host || 'https://ventura-api.herokuapp.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/people',
    });
  }
}
