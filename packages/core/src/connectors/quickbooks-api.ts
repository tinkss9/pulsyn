// QuickBooks API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'customers', endpoint: '/company/{id}/query?query=SELECT * FROM Customer MAXRESULTS 20', schema: { name: 'customers', table: 'customers', columns: [{ name: 'Id', type: 'string', nullable: false, primaryKey: true }, { name: 'DisplayName', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['Id'] }, idField: 'Id' }
];

@registerSource('quickbooks-api')
export class QuickbooksApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'quickbooks-api', 'quickbooks-api', config, {
      baseUrl: config.host || 'https://quickbooks.api.intuit.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/company/{id}/query',
    });
  }
}
