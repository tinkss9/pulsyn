// @ts-nocheck
// BambooHR Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'employees', endpoint: '/api/gateway.php/{company}/v1/employees/directory', schema: { name: 'employees', table: 'employees', columns: [
    { name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'firstName', type: 'string', nullable: true },
    { name: 'lastName', type: 'string', nullable: true }, { name: 'email', type: 'string', nullable: true },
    { name: 'jobTitle', type: 'string', nullable: true }, { name: 'department', type: 'string', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
];

@registerSource('bamboohr')
export class BamboohrConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bamboohr', 'bamboohr', config, {
      baseUrl: config.host || 'https://api.bamboohr.com',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/gateway.php/{company}/v1/meta/fields',
    });
  }
}
