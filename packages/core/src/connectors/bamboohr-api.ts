// BambooHR API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'employees', endpoint: '/v1/employees/directory', schema: { name: 'employees', table: 'employees', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'firstName', type: 'string', nullable: false, primaryKey: false }, { name: 'lastName', type: 'string', nullable: false, primaryKey: false }, { name: 'email', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('bamboohr-api')
export class BamboohrApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bamboohr-api', 'bamboohr-api', config, {
      baseUrl: config.host || 'https://api.bamboohr.com/api/gateway.php/{company}',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v1/employees/directory',
    });
  }
}
