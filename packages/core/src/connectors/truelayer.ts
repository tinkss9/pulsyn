// @ts-nocheck
// TrueLayer Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'account_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'account_type', type: 'string', nullable: true },
      { name: 'currency', type: 'string', nullable: true },
      ],
      primaryKey: ['account_id'],
    },
    idField: 'account_id',
    
  },
];

@registerSource('truelayer')
export class TrueLayerConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'truelayer', 'truelayer', config, {
      baseUrl: config.host || 'https://api.truelayer.com/data/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
