// @ts-nocheck
// SysAid Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tickets',
    endpoint: '/tickets',
    schema: {
      name: 'tickets',
      table: 'tickets',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'create_date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sysaid')
export class SysAidConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sysaid', 'sysaid', config, {
      baseUrl: config.host || 'https://your-sysaid.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/tickets',
      
    });
  }
}
