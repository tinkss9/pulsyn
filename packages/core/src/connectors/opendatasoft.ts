// OpenDataSoft — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'datasets',
    endpoint: '/catalog/datasets?limit=20',
    schema: {
      name: 'datasets',
      table: 'datasets',
      columns: [
        { name: 'dataset_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['dataset_id'],
    },
    idField: 'dataset_id',
  }
];

@registerSource('opendatasoft')
export class OpendatasoftConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opendatasoft', 'opendatasoft', config, {
      baseUrl: config.host || 'https://public.opendatsoutheast.fr/api/explore/v2.1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/catalog/datasets',
    });
  }
}
