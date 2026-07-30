// @ts-nocheck
// Tiny ERP Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'invoices',
    endpoint: '/notas.fiscais.pesquisa.php',
    schema: {
      name: 'invoices',
      table: 'invoices',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'numero', type: 'string', nullable: true },
      { name: 'valor', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('tiny-erp')
export class TinyERPConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tiny-erp', 'tiny-erp', config, {
      baseUrl: config.host || 'https://api.tiny.com.br/api2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/notas.fiscais.pesquisa.php',
      
    });
  }
}
