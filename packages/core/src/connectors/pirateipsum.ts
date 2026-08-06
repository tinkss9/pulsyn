// Pirate Ipsum — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'text', endpoint: '/api/?paras=1', schema: { name: 'text', table: 'text', columns: [        { name: 'text', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['text'] }, idField: 'text' }];

@registerSource('pirateipsum')
export class PirateipsumConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pirateipsum', 'pirateipsum', config, { baseUrl: config.host || 'https://pirateipsum.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/api/' });
  }
}
