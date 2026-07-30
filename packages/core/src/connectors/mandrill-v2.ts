// @ts-nocheck
// Mandrill v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/messages/search.json',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: '_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: true },
      { name: 'sender', type: 'string', nullable: true },
      { name: 'ts', type: 'datetime', nullable: true },
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
    
  },
];

@registerSource('mandrill-v2')
export class Mandrillv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mandrill-v2', 'mandrill-v2', config, {
      baseUrl: config.host || 'https://mandrillapp.com/api/1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users/info.json',
      
    });
  }
}
