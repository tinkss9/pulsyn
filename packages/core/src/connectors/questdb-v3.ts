// @ts-nocheck
// QuestDB v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/exec?query=SHOW+TABLES',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'table', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['table'],
    },
    idField: 'table',
    
  },
];

@registerSource('questdb-v3')
export class QuestDBv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'questdb-v3', 'questdb-v3', config, {
      baseUrl: config.host || 'http://localhost:9000',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/exec',
      
    });
  }
}
