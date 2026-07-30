// @ts-nocheck
// Yodlee Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'accountName', type: 'string', nullable: true },
      { name: 'balance', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('yodlee')
export class YodleeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'yodlee', 'yodlee', config, {
      baseUrl: config.host || 'https://sandbox.api.yodlee.com/ysl',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts',
      
    });
  }
}
