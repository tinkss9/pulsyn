// @ts-nocheck
// VoteBuilder Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'voters',
    endpoint: '/voters',
    schema: {
      name: 'voters',
      table: 'voters',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('votebuilder')
export class VoteBuilderConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'votebuilder', 'votebuilder', config, {
      baseUrl: config.host || 'https://api.votebuilder.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/voters',
      
    });
  }
}
