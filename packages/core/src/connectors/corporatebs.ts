// Corporate BS — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'phrases',
    endpoint: '/',
    schema: {
      name: 'phrases',
      table: 'phrases',
      columns: [
        { name: 'phrase', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['phrase'],
    },
    idField: 'phrase',
  }
];

@registerSource('corporatebs')
export class CorporatebsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'corporatebs', 'corporatebs', config, {
      baseUrl: config.host || 'https://corporatebs-generator.sameerkumar.website',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
