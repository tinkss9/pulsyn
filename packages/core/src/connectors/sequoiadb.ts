// @ts-nocheck
// SequoiaDB Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'databases',
    endpoint: '/databases',
    schema: {
      name: 'databases',
      table: 'databases',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sequoiadb')
export class SequoiaDBConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sequoiadb', 'sequoiadb', config, {
      baseUrl: config.host || 'https://api.sequoiadb.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/databases',
      
    });
  }
}
