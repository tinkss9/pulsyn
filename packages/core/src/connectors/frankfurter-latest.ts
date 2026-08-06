// Frankfurter Latest — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'latest', endpoint: '/latest', schema: { name: 'latest', table: 'latest', columns: [{ name: 'base', type: 'string', nullable: false, primaryKey: true }, { name: 'rates', type: 'json', nullable: false, primaryKey: false }, { name: 'date', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['base'] }, idField: 'base' }
];

@registerSource('frankfurter-latest')
export class FrankfurterLatestConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'frankfurter-latest', 'frankfurter-latest', config, {
      baseUrl: config.host || 'https://api.frankfurter.app',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/latest',
    });
  }
}
