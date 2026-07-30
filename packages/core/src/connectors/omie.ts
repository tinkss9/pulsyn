// @ts-nocheck
// Omie Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/financas/nfconsultar/',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'codigo', type: 'number', nullable: false, primaryKey: true },
      { name: 'numero', type: 'string', nullable: true },
      { name: 'valor_total', type: 'number', nullable: true },
      ],
      primaryKey: ['codigo'],
    },
    idField: 'codigo',
    
  },
];

@registerSource('omie')
export class OmieConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'omie', 'omie', config, {
      baseUrl: config.host || 'https://app.omie.com.br/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/geral/conta/',
      
    });
  }
}
