// Transport for GB — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'places',
    endpoint: '/places.json?query=London&type=train_station&app_id=demo&app_key=demo',
    schema: {
      name: 'places',
      table: 'places',
      columns: [
        { name: 'atcocode', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['atcocode'],
    },
    idField: 'atcocode',
  }
];

@registerSource('transport-gb')
export class TransportGbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'transport-gb', 'transport-gb', config, {
      baseUrl: config.host || 'https://transportapi.com/v3',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/places.json',
    });
  }
}
