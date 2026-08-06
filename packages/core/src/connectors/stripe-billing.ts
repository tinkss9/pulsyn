// Stripe Billing — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'subscriptions', endpoint: '/subscriptions?limit=20', schema: { name: 'subscriptions', table: 'subscriptions', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'status', type: 'string', nullable: false, primaryKey: false }, { name: 'current_period_end', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'invoices', endpoint: '/invoices?limit=20', schema: { name: 'invoices', table: 'invoices', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'amount_due', type: 'number', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('stripe-billing')
export class StripeBillingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'stripe-billing', 'stripe-billing', config, {
      baseUrl: config.host || 'https://api.stripe.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/subscriptions',
    });
  }
}
