// @ts-nocheck
// Meditech Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'patients',
    endpoint: '/patients',
    schema: {
      name: 'patients',
      table: 'patients',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('meditech')
export class MeditechConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'meditech', 'meditech', config, {
      baseUrl: config.host || 'https://api.meditech.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/patients',
      
    });
  }
}
