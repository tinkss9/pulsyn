// Adblock Check — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'check', endpoint: '/check', schema: { name: 'check', table: 'check', columns: [        { name: 'blocked', type: 'boolean', nullable: false, primaryKey: true }], primaryKey: ['blocked'] }, idField: 'blocked' }];

@registerSource('adblock-check')
export class AdblockCheckConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'adblock-check', 'adblock-check', config, { baseUrl: config.host || 'https://adblock-checker.p.rapidapi.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/check' });
  }
}
