// CocoaPods — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'pods',
    endpoint: '/pods?query=alamofire',
    schema: {
      name: 'pods',
      table: 'pods',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'version', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('cocoapods')
export class CocoapodsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cocoapods', 'cocoapods', config, {
      baseUrl: config.host || 'https://trunk.cocoapods.org/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/pods',
    });
  }
}
