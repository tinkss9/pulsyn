// Bored API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'activities',
    endpoint: '/random',
    schema: {
      name: 'activities',
      table: 'activities',
      columns: [
        { name: 'activity', type: 'string', nullable: false, primaryKey: true },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'participants', type: 'number', nullable: false, primaryKey: false },
        { name: 'price', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['activity'],
    },
    idField: 'activity',
  }
];

@registerSource('boredapi')
export class BoredapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'boredapi', 'boredapi', config, {
      baseUrl: config.host || 'https://bored-api.appbrewery.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/random',
    });
  }
}
