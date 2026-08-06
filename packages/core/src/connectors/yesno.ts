// YesNo API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'answers', endpoint: '/', schema: { name: 'answers', table: 'answers', columns: [        { name: 'answer', type: 'string', nullable: false, primaryKey: true },
        { name: 'forced', type: 'boolean', nullable: false, primaryKey: false },
        { name: 'image', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['answer'] }, idField: 'answer' }];

@registerSource('yesno')
export class YesnoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'yesno', 'yesno', config, { baseUrl: config.host || 'https://yesno.wtf/api', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/' });
  }
}
