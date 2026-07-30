// @ts-nocheck
// Splunk IoT Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'source', type: 'string', nullable: true },
      { name: 'sourcetype', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('splunk-iot')
export class SplunkIoTConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'splunk-iot', 'splunk-iot', config, {
      baseUrl: config.host || 'https://your-splunk.com:8089/services',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/server/info',
      
    });
  }
}
