// @ts-nocheck
// Epic EHR Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'patients',
    endpoint: '/Patient',
    schema: {
      name: 'patients',
      table: 'patients',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'object', nullable: true },
      { name: 'birthDate', type: 'date', nullable: true },
      { name: 'gender', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('epic')
export class EpicEHRConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'epic', 'epic', config, {
      baseUrl: config.host || 'https://fhir.epic.com/interconnect-fhir-oauth',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Patient',
      
    });
  }
}
