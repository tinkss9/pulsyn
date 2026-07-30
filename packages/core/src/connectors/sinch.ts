// @ts-nocheck
// Sinch Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/batches',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'to', type: 'string', nullable: true },
      { name: 'body', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sinch')
export class SinchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sinch', 'sinch', config, {
      baseUrl: config.host || 'https://sms.api.sinch.com/xms/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/batches',
      
    });
  }
}
