// @ts-nocheck
// Shortcut v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'stories',
    endpoint: '/stories',
    schema: {
      name: 'stories',
      table: 'stories',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('shortcut-v2')
export class Shortcutv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'shortcut-v2', 'shortcut-v2', config, {
      baseUrl: config.host || 'https://api.app.shortcut.com/api/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/member',
      
    });
  }
}
