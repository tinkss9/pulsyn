// EarthCam — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'cameras',
    endpoint: '/cameras',
    schema: {
      name: 'cameras',
      table: 'cameras',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'location', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('cameras')
export class CamerasConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cameras', 'cameras', config, {
      baseUrl: config.host || 'https://api.earthcam.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cameras',
    });
  }
}
