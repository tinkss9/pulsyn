// WorldTimeAPI — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'timezones', endpoint: '/timezone', schema: { name: 'timezones', table: 'timezones', columns: [{ name: 'timezone', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['timezone'] }, idField: 'timezone' },
{ name: 'ip', endpoint: '/ip', schema: { name: 'ip', table: 'ip', columns: [{ name: 'abbreviation', type: 'string', nullable: false, primaryKey: true }, { name: 'datetime', type: 'string', nullable: false, primaryKey: false }, { name: 'timezone', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['abbreviation'] }, idField: 'abbreviation' }
];

@registerSource('worldtimeapi')
export class WorldtimeapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'worldtimeapi', 'worldtimeapi', config, {
      baseUrl: config.host || 'https://worldtimeapi.org/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/timezone',
    });
  }
}
