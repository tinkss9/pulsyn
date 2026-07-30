// @ts-nocheck
// athenahealth Connector — Auto-generated from config
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
      { name: 'patientid', type: 'number', nullable: false, primaryKey: true },
      { name: 'firstname', type: 'string', nullable: true },
      { name: 'lastname', type: 'string', nullable: true },
      { name: 'dob', type: 'date', nullable: true },
      ],
      primaryKey: ['patientid'],
    },
    idField: 'patientid',
    
  },
];

@registerSource('athenahealth')
export class athenahealthConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'athenahealth', 'athenahealth', config, {
      baseUrl: config.host || 'https://api.preview.athenahealth.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/practiceinfo',
      
    });
  }
}
