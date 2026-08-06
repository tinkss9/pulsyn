// UUID Generator — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'uuids', endpoint: '/api?count=10', schema: { name: 'uuids', table: 'uuids', columns: [        { name: 'uuid', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['uuid'] }, idField: 'uuid' }];

@registerSource('uuid-generator')
export class UuidGeneratorConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'uuid-generator', 'uuid-generator', config, { baseUrl: config.host || 'https://uuidgen.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/api' });
  }
}
