// @ts-nocheck
// ActiveMQ Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'queues',
    endpoint: '/read/org.apache.activemq:type=Broker,brokerName=localhost,destinationType=Queue,destinationName=*',
    schema: {
      name: 'queues',
      table: 'queues',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'QueueSize', type: 'number', nullable: true },
      { name: 'EnqueueCount', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('activemq')
export class ActiveMQConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'activemq', 'activemq', config, {
      baseUrl: config.host || 'http://localhost:8161/api/jolokia',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/version',
      
    });
  }
}
