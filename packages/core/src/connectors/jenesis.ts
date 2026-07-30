// @ts-nocheck
// Jenesis Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'policies',
    endpoint: '/policies',
    schema: {
      name: 'policies',
      table: 'policies',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'policyNumber', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('jenesis')
export class JenesisConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jenesis', 'jenesis', config, {
      baseUrl: config.host || 'https://api.jenesis.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/policies',
      
    });
  }
}
