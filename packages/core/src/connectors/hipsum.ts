// Hipster Ipsum — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'text', endpoint: '/?type=hipster-centric&paras=1', schema: { name: 'text', table: 'text', columns: [        { name: 'text', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['text'] }, idField: 'text' }];

@registerSource('hipsum')
export class HipsumConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hipsum', 'hipsum', config, { baseUrl: config.host || 'https://hipsum.co/api', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/' });
  }
}
