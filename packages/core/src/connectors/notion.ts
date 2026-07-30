// @ts-nocheck
// Notion Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'databases', endpoint: '/v1/search', schema: { name: 'databases', table: 'databases', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: true },
    { name: 'created_time', type: 'datetime', nullable: true }, { name: 'last_edited_time', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'last_edited_time' },
  { name: 'pages', endpoint: '/v1/search', schema: { name: 'pages', table: 'pages', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: true },
    { name: 'created_time', type: 'datetime', nullable: true }, { name: 'last_edited_time', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'last_edited_time' },
];

@registerSource('notion')
export class NotionConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'notion', 'notion', config, {
      baseUrl: config.host || 'https://api.notion.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v1/users/me',
      headers: { 'Notion-Version': '2022-06-28' },
    });
  }
}
