// @ts-nocheck
// AppDynamics v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'applications',
    endpoint: '/applications',
    schema: {
      name: 'applications',
      table: 'applications',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('appdynamics-v2')
export class AppDynamicsv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'appdynamics-v2', 'appdynamics-v2', config, {
      baseUrl: config.host || 'https://your-controller.saas.appdynamics.com/controller/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/applications',
      
    });
  }
}
