// @ts-nocheck
// RingCentral v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'calls',
    endpoint: '/account/~/call-log',
    schema: {
      name: 'calls',
      table: 'calls',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'direction', type: 'string', nullable: true },
      { name: 'duration', type: 'number', nullable: true },
      { name: 'startTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('ringcentral-v2')
export class RingCentralv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ringcentral-v2', 'ringcentral-v2', config, {
      baseUrl: config.host || 'https://platform.ringcentral.com/restapi/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/account',
      
    });
  }
}
