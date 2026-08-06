// NASA TechPort — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'projects', endpoint: '/projects?updatedSince=2026-01-01', schema: { name: 'projects', table: 'projects', columns: [{ name: 'projectId', type: 'number', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['projectId'] }, idField: 'projectId' }
];

@registerSource('nasa-techport')
export class NasaTechportConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nasa-techport', 'nasa-techport', config, {
      baseUrl: config.host || 'https://techport.nasa.gov/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/projects',
    });
  }
}
