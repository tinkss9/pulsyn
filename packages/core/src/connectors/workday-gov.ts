// @ts-nocheck
// Workday Gov Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'workers',
    endpoint: '/workers',
    schema: {
      name: 'workers',
      table: 'workers',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'preferredName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('workday-gov')
export class WorkdayGovConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'workday-gov', 'workday-gov', config, {
      baseUrl: config.host || 'https://your-workday.com/ccx/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/workers',
      
    });
  }
}
