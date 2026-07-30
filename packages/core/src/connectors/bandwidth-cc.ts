// @ts-nocheck
// Bandwidth CC Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'calls',
    endpoint: '/calls',
    schema: {
      name: 'calls',
      table: 'calls',
      columns: [
      { name: 'callId', type: 'string', nullable: false, primaryKey: true },
      { name: 'from', type: 'string', nullable: true },
      { name: 'to', type: 'string', nullable: true },
      { name: 'startTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['callId'],
    },
    idField: 'callId',
    
  },
];

@registerSource('bandwidth-cc')
export class BandwidthCCConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bandwidth-cc', 'bandwidth-cc', config, {
      baseUrl: config.host || 'https://voice.bandwidth.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/calls',
      
    });
  }
}
