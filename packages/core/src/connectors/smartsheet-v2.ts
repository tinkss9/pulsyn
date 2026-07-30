// @ts-nocheck
// Smartsheet v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'sheets',
    endpoint: '/sheets',
    schema: {
      name: 'sheets',
      table: 'sheets',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'modified_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'modified_at',
  },
];

@registerSource('smartsheet-v2')
export class Smartsheetv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'smartsheet-v2', 'smartsheet-v2', config, {
      baseUrl: config.host || 'https://api.smartsheet.com/2.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users/me',
      
    });
  }
}
