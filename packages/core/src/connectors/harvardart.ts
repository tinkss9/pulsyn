// Harvard Art Museums — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'objects',
    endpoint: '/object?apikey=DEMO_KEY&size=50',
    schema: {
      name: 'objects',
      table: 'objects',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'people', type: 'json', nullable: false, primaryKey: false },
        { name: 'classification', type: 'string', nullable: false, primaryKey: false },
        { name: 'period', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('harvardart')
export class HarvardartConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'harvardart', 'harvardart', config, {
      baseUrl: config.host || 'https://api.harvardartmuseums.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/object',
    });
  }
}
