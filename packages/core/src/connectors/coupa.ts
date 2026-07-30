// @ts-nocheck
// Coupa Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'suppliers',
    endpoint: '/suppliers',
    schema: {
      name: 'suppliers',
      table: 'suppliers',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('coupa')
export class CoupaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coupa', 'coupa', config, {
      baseUrl: config.host || 'https://your-instance.coupacloud.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/suppliers',
      
    });
  }
}
