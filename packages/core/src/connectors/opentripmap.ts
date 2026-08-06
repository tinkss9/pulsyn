// OpenTripMap — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'places',
    endpoint: '/places/bbox?lon_min=-180&lat_min=-90&lon_max=180&lat_max=90&kinds=interesting_places&limit=50&apikey=5ae2e3f221c38a28845f05b6b1b8e6e3e6b1b8e6e3e6b1b8e6e3e6b1b8',
    schema: {
      name: 'places',
      table: 'places',
      columns: [
        { name: 'xid', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'kinds', type: 'string', nullable: false, primaryKey: false },
        { name: 'point', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['xid'],
    },
    idField: 'xid',
  }
];

@registerSource('opentripmap')
export class OpentripmapConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opentripmap', 'opentripmap', config, {
      baseUrl: config.host || 'https://api.opentripmap.com/0.1/en',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/places/bbox',
    });
  }
}
