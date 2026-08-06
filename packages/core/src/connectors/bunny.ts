// Random Bunny — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'bunnies', endpoint: '/random/?media=gif,png', schema: { name: 'bunnies', table: 'bunnies', columns: [        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'image', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }];

@registerSource('bunny')
export class BunnyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bunny', 'bunny', config, { baseUrl: config.host || 'https://api.bunnies.io/v2/loop', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/random/' });
  }
}
