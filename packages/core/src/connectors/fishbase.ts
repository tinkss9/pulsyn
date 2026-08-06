// FishWatch API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'species',
    endpoint: '/species',
    schema: {
      name: 'species',
      table: 'species',
      columns: [
        { name: 'Species_Name', type: 'string', nullable: false, primaryKey: true },
        { name: 'Scientific_Name', type: 'string', nullable: false, primaryKey: false },
        { name: 'Habitat', type: 'string', nullable: false, primaryKey: false },
        { name: 'Location', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['Species_Name'],
    },
    idField: 'Species_Name',
  }
];

@registerSource('fishbase')
export class FishbaseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fishbase', 'fishbase', config, {
      baseUrl: config.host || 'https://www.fishwatch.gov/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/species',
    });
  }
}
