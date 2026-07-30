// @ts-nocheck
// ServiceNow Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'incidents',
    endpoint: '/table/incident',
    schema: {
      name: 'incidents',
      table: 'incidents',
      columns: [
      { name: 'sys_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'number', type: 'string', nullable: false },
      { name: 'short_description', type: 'string', nullable: true },
      { name: 'state', type: 'string', nullable: true },
      { name: 'sys_created_on', type: 'datetime', nullable: true },
      { name: 'sys_updated_on', type: 'datetime', nullable: true },
      ],
      primaryKey: ['sys_id'],
    },
    idField: 'sys_id',
    modifiedField: 'sys_updated_on',
  },
];

@registerSource('servicenow')
export class ServiceNowConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'servicenow', 'servicenow', config, {
      baseUrl: config.host || 'https://your-instance.service-now.com/api/now',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/table/sys_user?sysparm_limit=1',
      
    });
  }
}
