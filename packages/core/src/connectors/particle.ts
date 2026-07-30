// @ts-nocheck
// Particle Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'devices',
    endpoint: '/devices',
    schema: {
      name: 'devices',
      table: 'devices',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'last_heard', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('particle')
export class ParticleConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'particle', 'particle', config, {
      baseUrl: config.host || 'https://api.particle.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/devices',
      
    });
  }
}
