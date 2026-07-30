// @ts-nocheck
// Bling Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contatos',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'nome', type: 'string', nullable: false },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('bling')
export class BlingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bling', 'bling', config, {
      baseUrl: config.host || 'https://www.bling.com.br/Api/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/contatos',
      
    });
  }
}
