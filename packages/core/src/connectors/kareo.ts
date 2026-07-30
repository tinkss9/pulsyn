// @ts-nocheck
// Kareo Connector — Auto-generated from config
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
      { name: 'Id', type: 'number', nullable: false, primaryKey: true },
      { name: 'FirstName', type: 'string', nullable: true },
      { name: 'LastName', type: 'string', nullable: true },
      ],
      primaryKey: ['Id'],
    },
    idField: 'Id',
    
  },
];

@registerSource('kareo')
export class KareoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kareo', 'kareo', config, {
      baseUrl: config.host || 'https://api.kareo.com/external/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/patients',
      
    });
  }
}
