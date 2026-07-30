// @ts-nocheck
// PowerSchool Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('powerschool')
export class PowerSchoolConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'powerschool', 'powerschool', config, {
      baseUrl: config.host || 'https://your-district.powerschool.com/ws/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/school',
      
    });
  }
}
