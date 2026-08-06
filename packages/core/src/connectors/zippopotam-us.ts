// Zippopotam US — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'us', endpoint: '/us/90210', schema: { name: 'us', table: 'us', columns: [{ name: 'post code', type: 'string', nullable: false, primaryKey: true }, { name: 'country', type: 'string', nullable: false, primaryKey: false }, { name: 'places', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['post code'] }, idField: 'post code' }
];

@registerSource('zippopotam-us')
export class ZippopotamUsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zippopotam-us', 'zippopotam-us', config, {
      baseUrl: config.host || 'https://api.zippopotam.us',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/us/90210',
    });
  }
}
