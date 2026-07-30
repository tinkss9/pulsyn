// @ts-nocheck
// Canvas LMS Connector — Auto-generated from config
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
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('canvas-lms')
export class CanvasLMSConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'canvas-lms', 'canvas-lms', config, {
      baseUrl: config.host || 'https://your-school.instructure.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'link',
      healthEndpoint: '/courses',
      
    });
  }
}
