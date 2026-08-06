// Google Fonts — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'fonts', endpoint: '/webfonts?sort=popularity&key=demo', schema: { name: 'fonts', table: 'fonts', columns: [        { name: 'family', type: 'string', nullable: false, primaryKey: true },
        { name: 'category', type: 'string', nullable: false, primaryKey: false },
        { name: 'variants', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['family'] }, idField: 'family' }];

@registerSource('google-fonts')
export class GoogleFontsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-fonts', 'google-fonts', config, { baseUrl: config.host || 'https://www.googleapis.com/webfonts/v1', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/webfonts' });
  }
}
