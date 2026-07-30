// @ts-nocheck
// Moodle Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'courses',
    endpoint: '/core_course_get_courses',
    schema: {
      name: 'courses',
      table: 'courses',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'fullname', type: 'string', nullable: false },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('moodle')
export class MoodleConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'moodle', 'moodle', config, {
      baseUrl: config.host || 'https://your-moodle.com/webservice/restful/server.php',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/core_webservice_get_site_info',
      
    });
  }
}
