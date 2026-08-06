// Hex.pm (Elixir) — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'packages', endpoint: '/packages?page=1', schema: { name: 'packages', table: 'packages', columns: [        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'latest_stable_version', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }];

@registerSource('hex-pm')
export class HexPmConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hex-pm', 'hex-pm', config, { baseUrl: config.host || 'hex.pm/api', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/packages' });
  }
}
