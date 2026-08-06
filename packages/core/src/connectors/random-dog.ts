// Random Dog — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'dogs', endpoint: '/woof.json', schema: { name: 'dogs', table: 'dogs', columns: [        { name: 'url', type: 'string', nullable: false, primaryKey: true },
        { name: 'fileSizeBytes', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['url'] }, idField: 'url' }];

@registerSource('random-dog')
export class RandomDogConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'random-dog', 'random-dog', config, { baseUrl: config.host || 'https://random.dog', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/woof.json' });
  }
}
