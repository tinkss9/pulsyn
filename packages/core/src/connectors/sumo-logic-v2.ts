// @ts-nocheck
// Sumo Logic v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'collectors',
    endpoint: '/collectors',
    schema: {
      name: 'collectors',
      table: 'collectors',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sumo-logic-v2')
export class SumoLogicv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sumo-logic-v2', 'sumo-logic-v2', config, {
      baseUrl: config.host || 'https://api.sumologic.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/collectors',
      
    });
  }
}
