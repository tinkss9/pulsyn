// @ts-nocheck
// InsideSales Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leads',
    endpoint: '/leads',
    schema: {
      name: 'leads',
      table: 'leads',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('insidesales')
export class InsideSalesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'insidesales', 'insidesales', config, {
      baseUrl: config.host || 'https://api.insidesales.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/leads',
      
    });
  }
}
