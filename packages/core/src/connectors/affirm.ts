// @ts-nocheck
// Affirm Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'charges',
    endpoint: '/charges',
    schema: {
      name: 'charges',
      table: 'charges',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('affirm')
export class AffirmConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'affirm', 'affirm', config, {
      baseUrl: config.host || 'https://sandbox.affirm.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/charges',
      
    });
  }
}
