// Timezone API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'timezones',
    endpoint: '/timezone',
    schema: {
      name: 'timezones',
      table: 'timezones',
      columns: [
        { name: 'timezone', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['timezone'],
    },
    idField: 'timezone',
  },
  {
    name: 'current',
    endpoint: '/ip',
    schema: {
      name: 'current',
      table: 'current',
      columns: [
        { name: 'abbreviation', type: 'string', nullable: false, primaryKey: true },
        { name: 'datetime', type: 'string', nullable: false, primaryKey: false },
        { name: 'timezone', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['abbreviation'],
    },
    idField: 'abbreviation',
  }
];

@registerSource('timezoneapi')
export class TimezoneapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'timezoneapi', 'timezoneapi', config, {
      baseUrl: config.host || 'https://worldtimeapi.org/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/timezone',
    });
  }
}
