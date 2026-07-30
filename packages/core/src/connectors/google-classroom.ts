// @ts-nocheck
// Google Classroom Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'courses',
    endpoint: '/courses',
    schema: {
      name: 'courses',
      table: 'courses',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'creationTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('google-classroom')
export class GoogleClassroomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-classroom', 'google-classroom', config, {
      baseUrl: config.host || 'https://classroom.googleapis.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/courses',
      
    });
  }
}
