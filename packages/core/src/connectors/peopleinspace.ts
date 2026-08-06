// People in Space — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'people', endpoint: '/astros.json', schema: { name: 'people', table: 'people', columns: [        { name: 'number', type: 'number', nullable: false, primaryKey: false },
        { name: 'people', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['number'] }, idField: 'number' }];

@registerSource('peopleinspace')
export class PeopleinspaceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'peopleinspace', 'peopleinspace', config, { baseUrl: config.host || 'http://api.open-notify.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/astros.json' });
  }
}
