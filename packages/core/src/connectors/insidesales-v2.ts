// @ts-nocheck
// InsideSales v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'opportunities',
    endpoint: '/opportunities',
    schema: {
      name: 'opportunities',
      table: 'opportunities',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'amount', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('insidesales-v2')
export class InsideSalesv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'insidesales-v2', 'insidesales-v2', config, {
      baseUrl: config.host || 'https://api.insidesales.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/opportunities',
      
    });
  }
}
