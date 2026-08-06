// Codeforces API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'problems',
    endpoint: '/problemset.problems',
    schema: {
      name: 'problems',
      table: 'problems',
      columns: [
        { name: 'contestId', type: 'number', nullable: false, primaryKey: true },
        { name: 'index', type: 'string', nullable: false, primaryKey: false },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'points', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['contestId'],
    },
    idField: 'contestId',
  }
];

@registerSource('codeforces')
export class CodeforcesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'codeforces', 'codeforces', config, {
      baseUrl: config.host || 'https://codeforces.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/problemset.problems',
    });
  }
}
