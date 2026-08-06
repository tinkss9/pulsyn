// Aviationstack — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'flights',
    endpoint: '/flights?access_key=demo&limit=20',
    schema: {
      name: 'flights',
      table: 'flights',
      columns: [
        { name: 'flight', type: 'json', nullable: false, primaryKey: true },
        { name: 'departure', type: 'json', nullable: false, primaryKey: false },
        { name: 'arrival', type: 'json', nullable: false, primaryKey: false },
        { name: 'airline', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['flight'],
    },
    idField: 'flight',
  }
];

@registerSource('aviationstack')
export class AviationstackConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'aviationstack', 'aviationstack', config, {
      baseUrl: config.host || 'http://api.aviationstack.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/flights',
    });
  }
}
