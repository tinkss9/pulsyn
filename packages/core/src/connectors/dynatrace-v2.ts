// @ts-nocheck
// Dynatrace v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'problems',
    endpoint: '/problems',
    schema: {
      name: 'problems',
      table: 'problems',
      columns: [
      { name: 'problemId', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'startTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['problemId'],
    },
    idField: 'problemId',
    
  },
];

@registerSource('dynatrace-v2')
export class Dynatracev2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dynatrace-v2', 'dynatrace-v2', config, {
      baseUrl: config.host || 'https://your-env.live.dynatrace.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/entities',
      
    });
  }
}
