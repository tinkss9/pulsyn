// @ts-nocheck
// Lemlist Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leads',
    endpoint: '/leads',
    schema: {
      name: 'leads',
      table: 'leads',
      columns: [
      { name: '_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
    
  },
];

@registerSource('lemlist')
export class LemlistConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lemlist', 'lemlist', config, {
      baseUrl: config.host || 'https://api.lemlist.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
