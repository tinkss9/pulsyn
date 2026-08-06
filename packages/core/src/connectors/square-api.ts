// Square API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'payments', endpoint: '/payments?limit=20', schema: { name: 'payments', table: 'payments', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'amount_money', type: 'json', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('square-api')
export class SquareApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'square-api', 'square-api', config, {
      baseUrl: config.host || 'https://connect.squareup.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/payments',
    });
  }
}
