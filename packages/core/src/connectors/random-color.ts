// Random Color — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'color', endpoint: '/random', schema: { name: 'color', table: 'color', columns: [        { name: 'hex', type: 'string', nullable: false, primaryKey: true },
        { name: 'rgb', type: 'string', nullable: false, primaryKey: false },
        { name: 'hsl', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['hex'] }, idField: 'hex' }];

@registerSource('random-color')
export class RandomColorConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'random-color', 'random-color', config, { baseUrl: config.host || 'https://x-colors.yurace.pro/api', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/random' });
  }
}
