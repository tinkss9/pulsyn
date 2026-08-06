// Notion Public Pages — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'table',
    endpoint: '/table/89f4e0b7c453409bb67a7b16b89d2e6f',
    schema: {
      name: 'table',
      table: 'table',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'Name', type: 'string', nullable: false, primaryKey: false },
        { name: 'Tags', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('notion-public')
export class NotionPublicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'notion-public', 'notion-public', config, {
      baseUrl: config.host || 'https://notion-api.splitbee.io/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/table/89f4e0b7c453409bb67a7b16b89d2e6f',
    });
  }
}
