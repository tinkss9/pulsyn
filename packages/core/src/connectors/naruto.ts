// Naruto API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'characters',
    endpoint: '/character?limit=50',
    schema: {
      name: 'characters',
      table: 'characters',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'personal', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('naruto')
export class NarutoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'naruto', 'naruto', config, {
      baseUrl: config.host || 'https://narutodb.xyz/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/character',
    });
  }
}
