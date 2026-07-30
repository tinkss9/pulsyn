// @ts-nocheck
// WhatsApp Business Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/{phone_number_id}/messages',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'from', type: 'string', nullable: true },
      { name: 'to', type: 'string', nullable: true },
      { name: 'timestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('whatsapp')
export class WhatsAppBusinessConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'whatsapp', 'whatsapp', config, {
      baseUrl: config.host || 'https://graph.facebook.com/v18.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/{phone_number_id}',
      
    });
  }
}
