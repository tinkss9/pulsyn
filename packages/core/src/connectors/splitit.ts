// @ts-nocheck
// Splitit Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'plans',
    endpoint: '/api/installmentplans',
    schema: {
      name: 'plans',
      table: 'plans',
      columns: [
      { name: 'InstallmentPlanId', type: 'string', nullable: false, primaryKey: true },
      { name: 'TotalAmount', type: 'number', nullable: true },
      { name: 'Status', type: 'string', nullable: true },
      ],
      primaryKey: ['InstallmentPlanId'],
    },
    idField: 'InstallmentPlanId',
    
  },
];

@registerSource('splitit')
export class SplititConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'splitit', 'splitit', config, {
      baseUrl: config.host || 'https://webapi.splitit.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/api/installmentplans',
      
    });
  }
}
