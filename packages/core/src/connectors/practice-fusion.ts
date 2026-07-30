// @ts-nocheck
// Practice Fusion Connector — Auto-generated from config
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
      { name: 'patientGuid', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['patientGuid'],
    },
    idField: 'patientGuid',
    
  },
];

@registerSource('practice-fusion')
export class PracticeFusionConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'practice-fusion', 'practice-fusion', config, {
      baseUrl: config.host || 'https://api.practicefusion.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/patients',
      
    });
  }
}
