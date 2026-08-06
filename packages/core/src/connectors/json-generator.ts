// JSON Generator — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'data', endpoint: '/api/json/get/ceERyDSWtu', schema: { name: 'data', table: 'data', columns: [        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'email', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }];

@registerSource('json-generator')
export class JsonGeneratorConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'json-generator', 'json-generator', config, { baseUrl: config.host || 'https://json-generator.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/api/json/get/ceERyDSWtu' });
  }
}
