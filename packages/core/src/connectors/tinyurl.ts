// TinyURL — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'shorten', endpoint: '?url=https://example.com', schema: { name: 'shorten', table: 'shorten', columns: [        { name: 'url', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['url'] }, idField: 'url' }];

@registerSource('tinyurl')
export class TinyurlConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tinyurl', 'tinyurl', config, { baseUrl: config.host || 'https://tinyurl.com/api-create.php', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '' });
  }
}
