// @ts-nocheck
// RabbitMQ Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'queues',
    endpoint: '/queues',
    schema: {
      name: 'queues',
      table: 'queues',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'messages', type: 'number', nullable: true },
      { name: 'consumers', type: 'number', nullable: true },
      { name: 'state', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
  {
    name: 'exchanges',
    endpoint: '/exchanges',
    schema: {
      name: 'exchanges',
      table: 'exchanges',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('rabbitmq')
export class RabbitMQConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rabbitmq', 'rabbitmq', config, {
      baseUrl: config.host || 'http://localhost:15672/api',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/overview',
      
    });
  }
}
