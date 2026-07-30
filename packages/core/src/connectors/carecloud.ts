// @ts-nocheck
// CareCloud Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('carecloud')
export class CareCloudConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'carecloud', 'carecloud', config, {
      baseUrl: config.host || 'https://api.carecloud.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/patients',
      
    });
  }
}
