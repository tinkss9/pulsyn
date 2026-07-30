// @ts-nocheck
// Focus NFe Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/nfe',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'valor_total', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('focus-nfe')
export class FocusNFeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'focus-nfe', 'focus-nfe', config, {
      baseUrl: config.host || 'https://api.focusnfe.com.br/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/nfe',
      
    });
  }
}
