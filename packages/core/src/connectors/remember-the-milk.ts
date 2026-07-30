// @ts-nocheck
// Remember The Milk Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tasks',
    endpoint: '/?method=rtm.tasks.getList',
    schema: {
      name: 'tasks',
      table: 'tasks',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'completed', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('remember-the-milk')
export class RememberTheMilkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'remember-the-milk', 'remember-the-milk', config, {
      baseUrl: config.host || 'https://api.rememberthemilk.com/rest',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/?method=rtm.auth.getToken',
      
    });
  }
}
