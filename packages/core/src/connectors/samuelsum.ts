// Samuel L Ipsum — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'text', endpoint: '/api/1', schema: { name: 'text', table: 'text', columns: [        { name: 'text', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['text'] }, idField: 'text' }];

@registerSource('samuelsum')
export class SamuelsumConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'samuelsum', 'samuelsum', config, { baseUrl: config.host || 'https://samuelipsum.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/api/1' });
  }
}
