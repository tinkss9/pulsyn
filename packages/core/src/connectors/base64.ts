// Base64 Decode — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'base64', endpoint: '/base64/dGVzdA==', schema: { name: 'base64', table: 'base64', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('base64')
export class Base64Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'base64', 'base64', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/base64/dGVzdA==' });
  }
}
