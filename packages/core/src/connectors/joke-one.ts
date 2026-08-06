// Joke One — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'jokes', endpoint: '/random_joke', schema: { name: 'jokes', table: 'jokes', columns: [        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'setup', type: 'string', nullable: false, primaryKey: false },
        { name: 'punchline', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }];

@registerSource('joke-one')
export class JokeOneConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'joke-one', 'joke-one', config, { baseUrl: config.host || 'https://official-joke-api.appspot.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/random_joke' });
  }
}
