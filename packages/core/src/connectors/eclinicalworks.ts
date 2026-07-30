// @ts-nocheck
// eClinicalWorks Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'dob', type: 'date', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('eclinicalworks')
export class eClinicalWorksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'eclinicalworks', 'eclinicalworks', config, {
      baseUrl: config.host || 'https://api.eclinicalworks.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/patients',
      
    });
  }
}
