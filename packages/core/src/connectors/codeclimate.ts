// @ts-nocheck
// Code Climate Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'repos',
    endpoint: '/repos',
    schema: {
      name: 'repos',
      table: 'repos',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'score', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('codeclimate')
export class CodeClimateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'codeclimate', 'codeclimate', config, {
      baseUrl: config.host || 'https://api.codeclimate.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
