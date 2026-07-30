// @ts-nocheck
// Climate FieldView Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'fields',
    endpoint: '/fields',
    schema: {
      name: 'fields',
      table: 'fields',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'area', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('climate-fieldview')
export class ClimateFieldViewConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'climate-fieldview', 'climate-fieldview', config, {
      baseUrl: config.host || 'https://climate.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/fields',
      
    });
  }
}
