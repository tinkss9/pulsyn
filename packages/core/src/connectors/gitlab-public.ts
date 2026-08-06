// GitLab Public — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'projects',
    endpoint: '/projects?visibility=public&per_page=20',
    schema: {
      name: 'projects',
      table: 'projects',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false },
        { name: 'web_url', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('gitlab-public')
export class GitlabPublicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gitlab-public', 'gitlab-public', config, {
      baseUrl: config.host || 'https://gitlab.com/api/v4',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/projects',
    });
  }
}
