// Image JPEG — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'image', endpoint: '/image/jpeg', schema: { name: 'image', table: 'image', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('image-jpeg')
export class ImageJpegConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'image-jpeg', 'image-jpeg', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/image/jpeg' });
  }
}
