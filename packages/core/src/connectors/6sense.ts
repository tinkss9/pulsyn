// @ts-nocheck
// 6sense Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'companies',
    endpoint: '/companies',
    schema: {
      name: 'companies',
      table: 'companies',
      columns: [
      { name: 'company_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'domain', type: 'string', nullable: true },
      ],
      primaryKey: ['company_id'],
    },
    idField: 'company_id',
    
  },
];

@registerSource('6sense')
export class SixSenseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, '6sense', '6sense', config, {
      baseUrl: config.host || 'https://api.6sense.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
