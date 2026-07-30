// @ts-nocheck
// Schoology Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'course_title', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('schoology')
export class SchoologyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'schoology', 'schoology', config, {
      baseUrl: config.host || 'https://api.schoology.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/courses',
      
    });
  }
}
