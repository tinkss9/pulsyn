// @ts-nocheck
// Plivo v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'phlo',
    endpoint: '/Account/{authId}/Phlo',
    schema: {
      name: 'phlo',
      table: 'phlo',
      columns: [
      { name: 'phlo_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['phlo_id'],
    },
    idField: 'phlo_id',
    
  },
];

@registerSource('plivo-v2')
export class Plivov2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'plivo-v2', 'plivo-v2', config, {
      baseUrl: config.host || 'https://api.plivo.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Account',
      
    });
  }
}
