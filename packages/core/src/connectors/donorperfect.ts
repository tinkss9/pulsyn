// @ts-nocheck
// DonorPerfect Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'donors',
    endpoint: '/donors',
    schema: {
      name: 'donors',
      table: 'donors',
      columns: [
      { name: 'donor_id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['donor_id'],
    },
    idField: 'donor_id',
    
  },
];

@registerSource('donorperfect')
export class DonorPerfectConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'donorperfect', 'donorperfect', config, {
      baseUrl: config.host || 'https://api.donorperfect.net/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/donors',
      
    });
  }
}
