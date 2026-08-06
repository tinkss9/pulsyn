// OpenDota — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'heroes',
    endpoint: '/heroes',
    schema: {
      name: 'heroes',
      table: 'heroes',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'localized_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'primary_attr', type: 'string', nullable: false, primaryKey: false },
        { name: 'attack_type', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('opendota')
export class OpendotaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opendota', 'opendota', config, {
      baseUrl: config.host || 'https://api.opendota.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/heroes',
    });
  }
}
