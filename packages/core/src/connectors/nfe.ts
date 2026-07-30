// @ts-nocheck
// NFe Connector — Auto-generated from config
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
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('nfe')
export class NFeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nfe', 'nfe', config, {
      baseUrl: config.host || 'https://api.nfe.fazenda.gov.br/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/nfe',
      
    });
  }
}
