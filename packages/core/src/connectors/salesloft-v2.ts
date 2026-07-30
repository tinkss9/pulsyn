// @ts-nocheck
// Salesloft v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'people',
    endpoint: '/people.json',
    schema: {
      name: 'people',
      table: 'people',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email_address', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('salesloft-v2')
export class Salesloftv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'salesloft-v2', 'salesloft-v2', config, {
      baseUrl: config.host || 'https://api.salesloft.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me.json',
      
    });
  }
}
