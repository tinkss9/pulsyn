// Segment API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'sources', endpoint: '/sources', schema: { name: 'sources', table: 'sources', columns: [{ name: 'name', type: 'string', nullable: false, primaryKey: true }, { name: 'slug', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }
];

@registerSource('segment-api')
export class SegmentApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'segment-api', 'segment-api', config, {
      baseUrl: config.host || 'https://platform.segmentapis.com/v1beta',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/sources',
    });
  }
}
