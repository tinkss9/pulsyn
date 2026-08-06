// Anime Chan — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'quotes', endpoint: '/random/available/anime', schema: { name: 'quotes', table: 'quotes', columns: [{ name: 'anime', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['anime'] }, idField: 'anime' }
];

@registerSource('anime-chan')
export class AnimeChanConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'anime-chan', 'anime-chan', config, {
      baseUrl: config.host || 'https://animechan.io/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/random/available/anime',
    });
  }
}
