// SpaceX API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'rockets',
    endpoint: '/rockets',
    schema: {
      name: 'rockets',
      table: 'rockets',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'company', type: 'string', nullable: false, primaryKey: false },
        { name: 'country', type: 'string', nullable: false, primaryKey: false },
        { name: 'cost_per_launch', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'launches',
    endpoint: '/launches',
    schema: {
      name: 'launches',
      table: 'launches',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'date_utc', type: 'string', nullable: false, primaryKey: false },
        { name: 'success', type: 'boolean', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'capsules',
    endpoint: '/capsules',
    schema: {
      name: 'capsules',
      table: 'capsules',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'status', type: 'string', nullable: false, primaryKey: false },
        { name: 'reuse_count', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('spacex')
export class SpacexConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'spacex', 'spacex', config, {
      baseUrl: config.host || 'https://api.spacexdata.com/v4',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/rockets',
    });
  }
}
