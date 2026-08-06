// Shiba Inu — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'shibas', endpoint: '/shibes?count=10', schema: { name: 'shibas', table: 'shibas', columns: [        { name: 'url', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['url'] }, idField: 'url' }];

@registerSource('shiba')
export class ShibaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'shiba', 'shiba', config, { baseUrl: config.host || 'https://shibe.online/api', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/shibes' });
  }
}
