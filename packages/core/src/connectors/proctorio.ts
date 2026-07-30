// @ts-nocheck
// Proctorio Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'exams',
    endpoint: '/exams',
    schema: {
      name: 'exams',
      table: 'exams',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('proctorio')
export class ProctorioConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'proctorio', 'proctorio', config, {
      baseUrl: config.host || 'https://api.proctorio.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/exams',
      
    });
  }
}
