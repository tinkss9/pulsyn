// Docker Hub — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'images',
    endpoint: '/search/repositories/?query=node&page_size=20',
    schema: {
      name: 'images',
      table: 'images',
      columns: [
        { name: 'repo_name', type: 'string', nullable: false, primaryKey: true },
        { name: 'short_description', type: 'string', nullable: false, primaryKey: false },
        { name: 'star_count', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['repo_name'],
    },
    idField: 'repo_name',
  }
];

@registerSource('dockerhub')
export class DockerhubConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dockerhub', 'dockerhub', config, {
      baseUrl: config.host || 'https://hub.docker.com/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search/repositories/',
    });
  }
}
