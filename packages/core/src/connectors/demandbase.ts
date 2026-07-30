// @ts-nocheck
// Demandbase Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'company_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'company_name', type: 'string', nullable: false },
      { name: 'domain', type: 'string', nullable: true },
      ],
      primaryKey: ['company_id'],
    },
    idField: 'company_id',
    
  },
];

@registerSource('demandbase')
export class DemandbaseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'demandbase', 'demandbase', config, {
      baseUrl: config.host || 'https://api.demandbase.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/ping',
      
    });
  }
}
