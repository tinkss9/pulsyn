// @ts-nocheck
// NationBuilder Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'people',
    endpoint: '/people',
    schema: {
      name: 'people',
      table: 'people',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('nationbuilder')
export class NationBuilderConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nationbuilder', 'nationbuilder', config, {
      baseUrl: config.host || 'https://{slug}.nationbuilder.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/people',
      
    });
  }
}
