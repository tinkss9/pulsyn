// @ts-nocheck
// Workday Student Connector — Auto-generated from config
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
      { name: 'preferredName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('workday-student')
export class WorkdayStudentConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'workday-student', 'workday-student', config, {
      baseUrl: config.host || 'https://your-workday.com/ccx/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/students',
      
    });
  }
}
