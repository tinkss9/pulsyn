// LeetCode GraphQL — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'problems',
    endpoint: '',
    schema: {
      name: 'problems',
      table: 'problems',
      columns: [
        { name: 'title', type: 'string', nullable: false, primaryKey: true },
        { name: 'difficulty', type: 'string', nullable: false, primaryKey: false },
        { name: 'categoryTitle', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['title'],
    },
    idField: 'title',
  }
];

@registerSource('leetcode')
export class LeetcodeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'leetcode', 'leetcode', config, {
      baseUrl: config.host || 'https://leetcode.com/graphql',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
