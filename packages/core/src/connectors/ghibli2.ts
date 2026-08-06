// Ghibli API v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'films',
    endpoint: '/films',
    schema: {
      name: 'films',
      table: 'films',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'director', type: 'string', nullable: false, primaryKey: false },
        { name: 'release_date', type: 'string', nullable: false, primaryKey: false },
        { name: 'rt_score', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'people',
    endpoint: '/people',
    schema: {
      name: 'people',
      table: 'people',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'gender', type: 'string', nullable: false, primaryKey: false },
        { name: 'age', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('ghibli2')
export class Ghibli2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ghibli2', 'ghibli2', config, {
      baseUrl: config.host || 'https://ghibliapi.vercel.app',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/films',
    });
  }
}
