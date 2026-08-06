// Exoplanet Archive — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'planets',
    endpoint: '/?query=select+top+20+pl_name,hostname,disc_year,pl_rade,pl_bmasse+from+ps&format=json',
    schema: {
      name: 'planets',
      table: 'planets',
      columns: [
        { name: 'pl_name', type: 'string', nullable: false, primaryKey: true },
        { name: 'hostname', type: 'string', nullable: false, primaryKey: false },
        { name: 'disc_year', type: 'number', nullable: false, primaryKey: false },
        { name: 'pl_rade', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['pl_name'],
    },
    idField: 'pl_name',
  }
];

@registerSource('exoplanet')
export class ExoplanetConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'exoplanet', 'exoplanet', config, {
      baseUrl: config.host || 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
