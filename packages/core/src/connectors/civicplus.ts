// @ts-nocheck
// CivicPlus Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'forms',
    endpoint: '/forms',
    schema: {
      name: 'forms',
      table: 'forms',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('civicplus')
export class CivicPlusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'civicplus', 'civicplus', config, {
      baseUrl: config.host || 'https://api.civicplus.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/forms',
      
    });
  }
}
