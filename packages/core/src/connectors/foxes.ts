// Random Fox — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'foxes', endpoint: '/floof/', schema: { name: 'foxes', table: 'foxes', columns: [        { name: 'image', type: 'string', nullable: false, primaryKey: true },
        { name: 'link', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['image'] }, idField: 'image' }];

@registerSource('foxes')
export class FoxesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'foxes', 'foxes', config, { baseUrl: config.host || 'https://randomfox.ca', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/floof/' });
  }
}
