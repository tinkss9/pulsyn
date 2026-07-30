// @ts-nocheck
// Infor Manufacturing Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'items',
    endpoint: '/items',
    schema: {
      name: 'items',
      table: 'items',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('infor-mfg')
export class InforManufacturingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'infor-mfg', 'infor-mfg', config, {
      baseUrl: config.host || 'https://api.infor.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/items',
      
    });
  }
}
