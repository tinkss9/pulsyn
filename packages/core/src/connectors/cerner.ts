// @ts-nocheck
// Cerner EHR Connector — Auto-generated from config
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
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('cerner')
export class CernerEHRConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cerner', 'cerner', config, {
      baseUrl: config.host || 'https://fhir-myrecord.cerner.com/r4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Patient',
      
    });
  }
}
