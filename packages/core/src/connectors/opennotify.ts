// OpenNotify ISS — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'iss_position',
    endpoint: '/iss-now.json',
    schema: {
      name: 'iss_position',
      table: 'iss_position',
      columns: [
        { name: 'timestamp', type: 'number', nullable: false, primaryKey: true },
        { name: 'latitude', type: 'string', nullable: false, primaryKey: false },
        { name: 'longitude', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['timestamp'],
    },
    idField: 'timestamp',
  },
  {
    name: 'people',
    endpoint: '/astros.json',
    schema: {
      name: 'people',
      table: 'people',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'craft', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('opennotify')
export class OpennotifyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opennotify', 'opennotify', config, {
      baseUrl: config.host || 'http://api.open-notify.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/iss-now.json',
    });
  }
}
