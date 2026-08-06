// Regulations.gov — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'documents',
    endpoint: '/documents?filter[documentType]=Rule&page[size]=20&api_key=demo',
    schema: {
      name: 'documents',
      table: 'documents',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'documentType', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('regulations')
export class RegulationsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'regulations', 'regulations', config, {
      baseUrl: config.host || 'https://api.regulations.gov/v4',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/documents',
    });
  }
}
