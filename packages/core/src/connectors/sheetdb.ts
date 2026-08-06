// SheetDB — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'rows',
    endpoint: '/a1b2c3d4e5f6g?limit=10',
    schema: {
      name: 'rows',
      table: 'rows',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('sheetdb')
export class SheetdbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sheetdb', 'sheetdb', config, {
      baseUrl: config.host || 'https://sheetdb.io/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/a1b2c3d4e5f6g',
    });
  }
}
