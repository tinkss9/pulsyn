// Launch Library 2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'launches', endpoint: '/launch/upcoming?limit=10&mode=list', schema: { name: 'launches', table: 'launches', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'net', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('launch-library-2')
export class LaunchLibrary2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'launch-library-2', 'launch-library-2', config, {
      baseUrl: config.host || 'https://ll.thespacedevs.com/2.2.0',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/launch/upcoming',
    });
  }
}
