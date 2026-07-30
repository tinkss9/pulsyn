// @ts-nocheck
// ConvertKit Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscribers',
    endpoint: '/subscribers',
    schema: {
      name: 'subscribers',
      table: 'subscribers',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'email_address', type: 'string', nullable: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('convertkit')
export class ConvertKitConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'convertkit', 'convertkit', config, {
      baseUrl: config.host || 'https://api.convertkit.com/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/account',
      
    });
  }
}
