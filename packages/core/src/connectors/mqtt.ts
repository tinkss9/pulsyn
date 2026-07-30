// @ts-nocheck
// MQTT Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'topics',
    endpoint: '/topics',
    schema: {
      name: 'topics',
      table: 'topics',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'messages', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('mqtt')
export class MQTTConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mqtt', 'mqtt', config, {
      baseUrl: config.host || 'http://localhost:1883',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status',
      
    });
  }
}
