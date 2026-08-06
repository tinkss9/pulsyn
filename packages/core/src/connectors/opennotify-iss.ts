// ISS Location — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'iss', endpoint: '/iss-now.json', schema: { name: 'iss', table: 'iss', columns: [{ name: 'timestamp', type: 'number', nullable: false, primaryKey: true }, { name: 'iss_position', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['timestamp'] }, idField: 'timestamp' },
{ name: 'people', endpoint: '/astros.json', schema: { name: 'people', table: 'people', columns: [{ name: 'number', type: 'number', nullable: false, primaryKey: false }, { name: 'people', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['number'] }, idField: 'number' }
];

@registerSource('opennotify-iss')
export class OpennotifyIssConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opennotify-iss', 'opennotify-iss', config, {
      baseUrl: config.host || 'http://api.open-notify.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/iss-now.json',
    });
  }
}
