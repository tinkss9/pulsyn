// Random Cat — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'cats', endpoint: '/meow', schema: { name: 'cats', table: 'cats', columns: [        { name: 'file', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['file'] }, idField: 'file' }];

@registerSource('random-cat')
export class RandomCatConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'random-cat', 'random-cat', config, { baseUrl: config.host || 'https://aws.random.cat', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/meow' });
  }
}
