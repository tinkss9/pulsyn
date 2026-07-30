// @ts-nocheck
// Allscripts Connector — Auto-generated from config
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
      { name: 'PatientID', type: 'number', nullable: false, primaryKey: true },
      { name: 'FirstName', type: 'string', nullable: true },
      { name: 'LastName', type: 'string', nullable: true },
      ],
      primaryKey: ['PatientID'],
    },
    idField: 'PatientID',
    
  },
];

@registerSource('allscripts')
export class AllscriptsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'allscripts', 'allscripts', config, {
      baseUrl: config.host || 'https://api.allscripts.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/patients',
      
    });
  }
}
