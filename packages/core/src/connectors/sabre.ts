// @ts-nocheck
// Sabre Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'flights',
    endpoint: '/shop/flights',
    schema: {
      name: 'flights',
      table: 'flights',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'price', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sabre')
export class SabreConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sabre', 'sabre', config, {
      baseUrl: config.host || 'https://api.sabre.com/v3.6.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/shop/flights',
      
    });
  }
}
