// @ts-nocheck
// Tempo v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'worklogs',
    endpoint: '/worklogs',
    schema: {
      name: 'worklogs',
      table: 'worklogs',
      columns: [
      { name: 'tempoAccountId', type: 'number', nullable: false, primaryKey: true },
      { name: 'description', type: 'string', nullable: true },
      { name: 'startDate', type: 'date', nullable: true },
      { name: 'timeSeconds', type: 'number', nullable: true },
      ],
      primaryKey: ['tempoAccountId'],
    },
    idField: 'tempoAccountId',
    
  },
];

@registerSource('tempo-v2')
export class Tempov2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tempo-v2', 'tempo-v2', config, {
      baseUrl: config.host || 'https://api.tempo.io/4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/worklogs',
      
    });
  }
}
