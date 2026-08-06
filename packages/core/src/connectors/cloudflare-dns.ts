// Cloudflare DNS — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'resolve',
    endpoint: '?name=example.com&type=A',
    schema: {
      name: 'resolve',
      table: 'resolve',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'type', type: 'number', nullable: false, primaryKey: false },
        { name: 'data', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('cloudflare-dns')
export class CloudflareDnsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cloudflare-dns', 'cloudflare-dns', config, {
      baseUrl: config.host || 'https://cloudflare-dns.com/dns-query',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
