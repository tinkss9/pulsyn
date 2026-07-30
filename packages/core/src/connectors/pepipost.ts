// @ts-nocheck
// Pepipost Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'emails',
    endpoint: '/stats',
    schema: {
      name: 'emails',
      table: 'emails',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('pepipost')
export class PepipostConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pepipost', 'pepipost', config, {
      baseUrl: config.host || 'https://api.pepipost.com/v5.1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/stats',
      
    });
  }
}
