// @ts-nocheck
// AdRoll Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'campaigns',
    endpoint: '/campaigns',
    schema: {
      name: 'campaigns',
      table: 'campaigns',
      columns: [
      { name: 'eid', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['eid'],
    },
    idField: 'eid',
    
  },
];

@registerSource('adroll')
export class AdRollConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'adroll', 'adroll', config, {
      baseUrl: config.host || 'https://services.adroll.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/advertisables',
      
    });
  }
}
