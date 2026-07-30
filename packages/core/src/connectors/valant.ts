// @ts-nocheck
// Valant Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('valant')
export class ValantConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'valant', 'valant', config, {
      baseUrl: config.host || 'https://api.valant.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/patients',
      
    });
  }
}
