// @ts-nocheck
// Azure IoT Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'devices',
    endpoint: '/devices',
    schema: {
      name: 'devices',
      table: 'devices',
      columns: [
      { name: 'deviceId', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'connectionState', type: 'string', nullable: true },
      ],
      primaryKey: ['deviceId'],
    },
    idField: 'deviceId',
    
  },
];

@registerSource('azure-iot')
export class AzureIoTConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'azure-iot', 'azure-iot', config, {
      baseUrl: config.host || 'https://your-hub.azure-devices.net',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/devices',
      
    });
  }
}
