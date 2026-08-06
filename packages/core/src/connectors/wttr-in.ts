// wttr.in Weather — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'weather', endpoint: '/London?format=j1', schema: { name: 'weather', table: 'weather', columns: [{ name: 'current_condition', type: 'json', nullable: false, primaryKey: true }, { name: 'nearest_area', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['current_condition'] }, idField: 'current_condition' }
];

@registerSource('wttr-in')
export class WttrInConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wttr-in', 'wttr-in', config, {
      baseUrl: config.host || 'https://wttr.in',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/London',
    });
  }
}
