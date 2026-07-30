// @ts-nocheck
// Viber Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/get_user_details',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('viber')
export class ViberConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'viber', 'viber', config, {
      baseUrl: config.host || 'https://chatapi.viber.com/pa',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/get_account_info',
      
    });
  }
}
