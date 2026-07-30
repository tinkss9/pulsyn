// @ts-nocheck
// Codacy Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'repositories',
    endpoint: '/user/repos',
    schema: {
      name: 'repositories',
      table: 'repositories',
      columns: [
      { name: 'uuid', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'language', type: 'string', nullable: true },
      ],
      primaryKey: ['uuid'],
    },
    idField: 'uuid',
    
  },
];

@registerSource('codacy')
export class CodacyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'codacy', 'codacy', config, {
      baseUrl: config.host || 'https://api.codacy.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
