// @ts-nocheck
// Microsoft 365 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'events',
    endpoint: '/me/events',
    schema: {
      name: 'events',
      table: 'events',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: true },
      { name: 'start', type: 'object', nullable: true },
      { name: 'createdDateTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('microsoft-365')
export class Microsoft365Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'microsoft-365', 'microsoft-365', config, {
      baseUrl: config.host || 'https://graph.microsoft.com/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
