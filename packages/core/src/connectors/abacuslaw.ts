// @ts-nocheck
// AbacusLaw Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('abacuslaw')
export class AbacusLawConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'abacuslaw', 'abacuslaw', config, {
      baseUrl: config.host || 'https://api.abacuslaw.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/contacts',
      
    });
  }
}
