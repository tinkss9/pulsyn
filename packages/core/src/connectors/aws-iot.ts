// @ts-nocheck
// AWS IoT Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'things',
    endpoint: '/things',
    schema: {
      name: 'things',
      table: 'things',
      columns: [
      { name: 'thingName', type: 'string', nullable: false, primaryKey: true },
      { name: 'thingTypeName', type: 'string', nullable: true },
      { name: 'version', type: 'number', nullable: true },
      ],
      primaryKey: ['thingName'],
    },
    idField: 'thingName',
    
  },
];

@registerSource('aws-iot')
export class AWSIoTConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'aws-iot', 'aws-iot', config, {
      baseUrl: config.host || 'https://iot.us-east-1.amazonaws.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/things',
      
    });
  }
}
