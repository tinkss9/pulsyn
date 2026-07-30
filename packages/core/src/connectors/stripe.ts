// @ts-nocheck
// Stripe Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'customers',
    endpoint: '/v1/customers',
    schema: { name: 'customers', table: 'customers', columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      { name: 'currency', type: 'string', nullable: true },
      { name: 'description', type: 'string', nullable: true },
    ], primaryKey: ['id'] },
    idField: 'id',
    modifiedField: 'created',
  },
  {
    name: 'charges',
    endpoint: '/v1/charges',
    schema: { name: 'charges', table: 'charges', columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: false },
      { name: 'currency', type: 'string', nullable: false },
      { name: 'customer', type: 'string', nullable: true },
      { name: 'description', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: false },
      { name: 'created', type: 'datetime', nullable: true },
    ], primaryKey: ['id'] },
    idField: 'id',
    modifiedField: 'created',
  },
  {
    name: 'invoices',
    endpoint: '/v1/invoices',
    schema: { name: 'invoices', table: 'invoices', columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'customer', type: 'string', nullable: false },
      { name: 'amount_due', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: false },
      { name: 'created', type: 'datetime', nullable: true },
    ], primaryKey: ['id'] },
    idField: 'id',
    modifiedField: 'created',
  },
  {
    name: 'subscriptions',
    endpoint: '/v1/subscriptions',
    schema: { name: 'subscriptions', table: 'subscriptions', columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'customer', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: false },
      { name: 'current_period_start', type: 'datetime', nullable: true },
      { name: 'current_period_end', type: 'datetime', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
    ], primaryKey: ['id'] },
    idField: 'id',
    modifiedField: 'created',
  },
];

@registerSource('stripe')
export class StripeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'stripe', 'stripe', config, {
      baseUrl: config.host || 'https://api.stripe.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v1/balance',
      rateLimit: { requests: 100, windowMs: 60000 },
    });
  }
}
