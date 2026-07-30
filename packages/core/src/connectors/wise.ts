// @ts-nocheck
// Wise Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'transfers',
    endpoint: '/transfers',
    schema: {
      name: 'transfers',
      table: 'transfers',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'targetAmount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('wise')
export class WiseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wise', 'wise', config, {
      baseUrl: config.host || 'https://api.wise.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/profiles',
      
    });
  }
}
