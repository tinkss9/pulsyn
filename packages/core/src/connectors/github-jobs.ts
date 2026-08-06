// GitHub Jobs — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'positions',
    endpoint: '/positions.json?description=python',
    schema: {
      name: 'positions',
      table: 'positions',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'company', type: 'string', nullable: false, primaryKey: false },
        { name: 'location', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('github-jobs')
export class GithubJobsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-jobs', 'github-jobs', config, {
      baseUrl: config.host || 'https://jobs.github.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/positions.json',
    });
  }
}
