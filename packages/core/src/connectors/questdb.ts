// @ts-nocheck
// QuestDB Connector — Auto-generated from config
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

@registerSource('questdb')
export class QuestDBConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'questdb', 'questdb', config, {
      baseUrl: config.host || 'http://localhost:9000',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/exec',
      
    });
  }
}
