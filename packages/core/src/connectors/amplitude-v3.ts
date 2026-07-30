// @ts-nocheck
// Amplitude v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'events',
    endpoint: '/events/segmentation',
    schema: {
      name: 'events',
      table: 'events',
      columns: [
      { name: 'event', type: 'string', nullable: false, primaryKey: true },
      { name: 'count', type: 'number', nullable: true },
      ],
      primaryKey: ['event'],
    },
    idField: 'event',
    
  },
];

@registerSource('amplitude-v3')
export class Amplitudev3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'amplitude-v3', 'amplitude-v3', config, {
      baseUrl: config.host || 'https://amplitude.com/api/2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/usersearch',
      
    });
  }
}
