// Cat Facts API Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'facts',
    endpoint: '/facts',
    schema: {
      name: 'facts',
      table: 'facts',
      columns: [
        { name: '_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'text', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: true, primaryKey: false },
        { name: 'user', type: 'string', nullable: true, primaryKey: false },
        { name: 'upvotes', type: 'number', nullable: true, primaryKey: false },
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
  },
];

@registerSource('catfacts')
export class CatFactsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'catfacts', 'catfacts', config, {
      baseUrl: config.host || 'https://cat-fact.herokuapp.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/facts',
    });
  }
}
