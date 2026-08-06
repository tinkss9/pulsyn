// QR Server — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'qr',
    endpoint: '/create-qr-code/?size=150x150&data=Example',
    schema: {
      name: 'qr',
      table: 'qr',
      columns: [
        { name: 'data', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['data'],
    },
    idField: 'data',
  }
];

@registerSource('qrserver')
export class QrserverConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'qrserver', 'qrserver', config, {
      baseUrl: config.host || 'https://api.qrserver.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/create-qr-code/',
    });
  }
}
