// @ts-nocheck
// Mailgun v2 Connector — Auto-generated from config
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
      { name: 'event', type: 'string', nullable: true },
      { name: 'timestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('mailgun-v2')
export class Mailgunv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mailgun-v2', 'mailgun-v2', config, {
      baseUrl: config.host || 'https://api.mailgun.net/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/domains',
      
    });
  }
}
