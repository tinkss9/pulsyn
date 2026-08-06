// Activity Suggestion — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'activities',
    endpoint: '/activity',
    schema: {
      name: 'activities',
      table: 'activities',
      columns: [
        { name: 'key', type: 'string', nullable: false, primaryKey: true },
        { name: 'activity', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'participants', type: 'number', nullable: false, primaryKey: false },
        { name: 'price', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['key'],
    },
    idField: 'key',
  }
];

@registerSource('activity-suggestion')
export class ActivitySuggestionConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'activity-suggestion', 'activity-suggestion', config, {
      baseUrl: config.host || 'https://www.boredapi.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/activity',
    });
  }
}
