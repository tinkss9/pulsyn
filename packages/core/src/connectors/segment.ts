// @ts-nocheck
// Segment Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'sources', endpoint: '/v1/sources', schema: { name: 'sources', table: 'sources', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'slug', type: 'string', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
  { name: 'destinations', endpoint: '/v1/destinations', schema: { name: 'destinations', table: 'destinations', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'enabled', type: 'boolean', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
];

@registerSource('segment')
export class SegmentConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'segment', 'segment', config, {
      baseUrl: config.host || 'https://platform.segmentapis.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v1/whoami',
    });
  }
}
