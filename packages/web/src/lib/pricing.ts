// Pulsyn Pricing Tiers Configuration
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
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: 'price_free',
    features: {
      pipelines: 3,
      rowsPerDay: 1000,
      connectors: 5,
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
      apiCalls: 1000,
      storage: 0.5,
      users: 1,
      retention: 7,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    priceId: 'price_starter_monthly',
    features: {
      pipelines: 10,
      rowsPerDay: 100000,
      connectors: 25,
      latency: '< 1 minute',
      support: 'Email',
      aiMapping: false,
      sso: false,
      onPrem: false,
      customConnectors: false,
      dedicatedEngineer: false,
      sla: '99.9%',
    },
    limits: {
      apiCalls: 10000,
      storage: 5,
      users: 3,
      retention: 30,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    priceId: 'price_pro_monthly',
    popular: true,
    features: {
      pipelines: 50,
      rowsPerDay: 1000000,
      connectors: 100,
      latency: '< 10 seconds',
      support: 'Priority',
      aiMapping: true,
      sso: false,
      onPrem: false,
      customConnectors: false,
      dedicatedEngineer: false,
      sla: '99.95%',
    },
    limits: {
      apiCalls: 100000,
      storage: 50,
      users: 10,
      retention: 90,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 1999,
    priceId: 'price_business_monthly',
    features: {
      pipelines: 200,
      rowsPerDay: 10000000,
      connectors: 763,
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
      apiCalls: 1000000,
      storage: 500,
      users: 50,
      retention: 365,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    priceId: 'price_enterprise_monthly',
    enterprise: true,
    features: {
      pipelines: -1,
      rowsPerDay: -1,
      connectors: 763,
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
  {
    id: 'datamesh',
    name: 'Data Mesh',
    price: 24999,
    priceId: 'price_datamesh_monthly',
    enterprise: true,
    features: {
      pipelines: -1,
      rowsPerDay: -1,
      connectors: 763,
      latency: '< 100ms',
      support: 'White Glove',
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
  if (price >= 1000) return `$${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
  return `$${price}`;
}

export function formatLimit(value: number, unit: string): string {
  if (value === -1) return 'Unlimited';
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M ${unit}`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ${unit}`;
  return `${value} ${unit}`;
}
