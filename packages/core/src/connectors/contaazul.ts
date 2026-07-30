// @ts-nocheck
// ContaAzul Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/invoices',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'number', type: 'string', nullable: true },
      { name: 'total', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('contaazul')
export class ContaAzulConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'contaazul', 'contaazul', config, {
      baseUrl: config.host || 'https://api.contaazul.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/invoices',
      
    });
  }
}
