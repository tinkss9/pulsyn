// Pulsyn Pricing Tiers Configuration
// Single source of truth — synced with packages/api/src/billing/plans.ts
export interface PricingTier {
  id: string;
  name: string;
  price: number; // monthly price in USD
  priceId: string; // Stripe price ID
  features: {
    pipelines: number; // -1 = unlimited
    rowsPerDay: number; // -1 = unlimited
    connectors: number; // -1 = all 763
    latency: string;
    support: string;
    aiMapping: boolean;
    sso: boolean;
    onPrem: boolean;
    customConnectors: boolean;
    dedicatedEngineer: boolean;
    sla: string;
  };
  limits: {
    apiCalls: number;
    storage: number; // GB
    users: number;
    retention: number; // days
  };
  popular?: boolean;
  enterprise?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'community',
    name: 'Community',
    price: 0,
    priceId: 'price_community',
    features: {
      pipelines: 3,
      rowsPerDay: 50000,
      connectors: 3,
      latency: '< 5 minutes',
      support: 'Community',
      aiMapping: false,
      sso: false,
      onPrem: false,
      customConnectors: false,
      dedicatedEngineer: false,
      sla: 'None',
    },
    limits: {
      apiCalls: 500,
      storage: 1,
      users: 1,
      retention: 7,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    priceId: 'price_pro_monthly',
    popular: true,
    features: {
      pipelines: -1,
      rowsPerDay: 5000000,
      connectors: -1,
      latency: '< 10 seconds',
      support: 'Priority',
      aiMapping: true,
      sso: false,
      onPrem: false,
      customConnectors: false,
      dedicatedEngineer: false,
      sla: '99.9%',
    },
    limits: {
      apiCalls: 10000,
      storage: 100,
      users: 10,
      retention: 90,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 3500,
    priceId: 'price_business_monthly',
    features: {
      pipelines: -1,
      rowsPerDay: 100000000,
      connectors: -1,
      latency: '< 1 second',
      support: 'Dedicated',
      aiMapping: true,
      sso: true,
      onPrem: false,
      customConnectors: true,
      dedicatedEngineer: false,
      sla: '99.99%',
    },
    limits: {
      apiCalls: 100000,
      storage: 1000,
      users: 50,
      retention: 365,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom — contact sales
    priceId: 'price_enterprise',
    enterprise: true,
    features: {
      pipelines: -1,
      rowsPerDay: -1,
      connectors: -1,
      latency: '< 100ms',
      support: 'Dedicated Engineer',
      aiMapping: true,
      sso: true,
      onPrem: true,
      customConnectors: true,
      dedicatedEngineer: true,
      sla: '99.999%',
    },
    limits: {
      apiCalls: -1,
      storage: -1,
      users: -1,
      retention: -1,
    },
  },
];

export function getTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id);
}

export function getTierByPriceId(priceId: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.priceId === priceId);
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `$${price.toLocaleString('en-US')}`;
}

export function formatLimit(value: number, unit: string): string {
  if (value === -1) return 'Unlimited';
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M ${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ${unit}`;
  return `${value} ${unit}`;
}
