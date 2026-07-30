// @ts-nocheck
// Heap v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'events',
    endpoint: '/events',
    schema: {
      name: 'events',
      table: 'events',
      columns: [
      { name: 'event_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'event_type', type: 'string', nullable: true },
      { name: 'time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['event_id'],
    },
    idField: 'event_id',
    
  },
];

@registerSource('heap-v2')
export class Heapv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'heap-v2', 'heap-v2', config, {
      baseUrl: config.host || 'https://heapanalytics.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/version',
      
    });
  }
}
