// @ts-nocheck
// Campus Management Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'students',
    endpoint: '/students',
    schema: {
      name: 'students',
      table: 'students',
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

@registerSource('campus-management')
export class CampusManagementConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'campus-management', 'campus-management', config, {
      baseUrl: config.host || 'https://api.campusmanagement.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/students',
      
    });
  }
}
