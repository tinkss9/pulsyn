// Random Duck — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'ducks', endpoint: '/api/random', schema: { name: 'ducks', table: 'ducks', columns: [        { name: 'url', type: 'string', nullable: false, primaryKey: true },
        { name: 'message', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['url'] }, idField: 'url' }];

@registerSource('random-duck')
export class RandomDuckConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'random-duck', 'random-duck', config, { baseUrl: config.host || 'https://random-d.uk', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/api/random' });
  }
}
