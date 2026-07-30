// @ts-nocheck
// Matomo v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'sites',
    endpoint: '?module=API&method=SitesManager.getAllSites&format=JSON',
    schema: {
      name: 'sites',
      table: 'sites',
      columns: [
      { name: 'idsite', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'main_url', type: 'string', nullable: true },
      ],
      primaryKey: ['idsite'],
    },
    idField: 'idsite',
    
  },
];

@registerSource('matomo-v2')
export class Matomov2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'matomo-v2', 'matomo-v2', config, {
      baseUrl: config.host || 'https://your-matomo.com/index.php',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '?module=API&method=SitesManager.getAllSites&format=JSON',
      
    });
  }
}
