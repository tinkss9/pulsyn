// Monday.com API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'boards', endpoint: '', schema: { name: 'boards', table: 'boards', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('monday-api')
export class MondayApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'monday-api', 'monday-api', config, {
      baseUrl: config.host || 'https://api.monday.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '',
    });
  }
}
