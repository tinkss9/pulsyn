// @ts-nocheck
// Contentful Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'entries', endpoint: '/spaces/{spaceId}/environments/master/entries', schema: { name: 'entries', table: 'entries', columns: [
    { name: 'sys.id', type: 'string', nullable: false, primaryKey: true }, { name: 'sys.type', type: 'string', nullable: true },
    { name: 'fields', type: 'object', nullable: true }, { name: 'sys.createdAt', type: 'datetime', nullable: true },
    { name: 'sys.updatedAt', type: 'datetime', nullable: true },
  ], primaryKey: ['sys.id'] }, idField: 'sys.id', modifiedField: 'sys.updatedAt' },
  { name: 'content_types', endpoint: '/spaces/{spaceId}/environments/master/content_types', schema: { name: 'content_types', table: 'content_types', columns: [
    { name: 'sys.id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'fields', type: 'object', nullable: true },
  ], primaryKey: ['sys.id'] }, idField: 'sys.id' },
];

@registerSource('contentful')
export class ContentfulConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'contentful', 'contentful', config, {
      baseUrl: config.host || 'https://cdn.contentful.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/spaces/{spaceId}',
    });
  }
}
