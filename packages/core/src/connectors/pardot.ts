// @ts-nocheck
// Pardot Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'prospects',
    endpoint: '/v4/prospects',
    schema: {
      name: 'prospects',
      table: 'prospects',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('pardot')
export class PardotConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pardot', 'pardot', config, {
      baseUrl: config.host || 'https://pi.pardot.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v4/prospect/version',
      
    });
  }
}
