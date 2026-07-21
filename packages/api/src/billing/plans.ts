// Pulsyn Billing Plans
// Tiered SaaS pricing definitions

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  currency: string;
  interval: 'month' | 'year';
  stripePriceId?: string; // Set after Stripe product creation
  features: PlanFeatures;
  limits: PlanLimits;
  metered: MeteredPricing;
}

export interface PlanFeatures {
  maxPipelines: number;
  maxRowsPerDay: number;
  maxConnectors: number;
  masking: boolean;
  checkpointRecovery: boolean;
  prioritySupport: boolean;
  sso: boolean;
  auditLogs: boolean;
  sla: boolean;
  whiteLabel: boolean;
}

export interface PlanLimits {
  apiCallsPerMinute: number;
  pipelineHoursPerMonth: number;
  storageGb: number;
}

export interface MeteredPricing {
  rowsReplicated: {
    freePerDay: number;
    perUnit: number; // cents per 100K rows
    unitSize: number; // 100_000
  };
  apiCalls: {
    freePerDay: number;
    perUnit: number; // cents per 100 calls
    unitSize: number; // 100
  };
  pipelineHours: {
    freePerMonth: number;
    perUnit: number; // cents per hour
  };
  storage: {
    freeGb: number;
    perGbMonth: number; // cents per GB/month
  };
}

export const PLANS: Record<string, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For freelancers and solopreneurs getting started with CDC',
    price: 9900, // $99.00
    currency: 'usd',
    interval: 'month',
    features: {
      maxPipelines: 1,
      maxRowsPerDay: 100_000,
      maxConnectors: 5,
      masking: false,
      checkpointRecovery: true,
      prioritySupport: false,
      sso: false,
      auditLogs: false,
      sla: false,
      whiteLabel: false,
    },
    limits: {
      apiCallsPerMinute: 60,
      pipelineHoursPerMonth: 720, // 24/7
      storageGb: 10,
    },
    metered: {
      rowsReplicated: {
        freePerDay: 10_000,
        perUnit: 50, // $0.50 per 100K rows
        unitSize: 100_000,
      },
      apiCalls: {
        freePerDay: 1_000,
        perUnit: 1, // $0.01 per 100 calls
        unitSize: 100,
      },
      pipelineHours: {
        freePerMonth: 10,
        perUnit: 10, // $0.10 per hour
      },
      storage: {
        freeGb: 1,
        perGbMonth: 50, // $0.50 per GB/month
      },
    },
  },

  business: {
    id: 'business',
    name: 'Business',
    description: 'For mid-market teams running production CDC pipelines',
    price: 49900, // $499.00
    currency: 'usd',
    interval: 'month',
    features: {
      maxPipelines: 10,
      maxRowsPerDay: 1_000_000,
      maxConnectors: 999, // all connectors
      masking: true,
      checkpointRecovery: true,
      prioritySupport: true,
      sso: false,
      auditLogs: false,
      sla: false,
      whiteLabel: false,
    },
    limits: {
      apiCallsPerMinute: 600,
      pipelineHoursPerMonth: 7200, // 10 pipelines 24/7
      storageGb: 100,
    },
    metered: {
      rowsReplicated: {
        freePerDay: 100_000,
        perUnit: 30, // $0.30 per 100K rows
        unitSize: 100_000,
      },
      apiCalls: {
        freePerDay: 10_000,
        perUnit: 1, // $0.01 per 100 calls
        unitSize: 100,
      },
      pipelineHours: {
        freePerMonth: 100,
        perUnit: 5, // $0.05 per hour
      },
      storage: {
        freeGb: 10,
        perGbMonth: 30, // $0.30 per GB/month
      },
    },
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with SLA, SSO, and unlimited scale',
    price: 249900, // $2,499.00
    currency: 'usd',
    interval: 'month',
    features: {
      maxPipelines: 999, // unlimited
      maxRowsPerDay: 100_000_000,
      maxConnectors: 999,
      masking: true,
      checkpointRecovery: true,
      prioritySupport: true,
      sso: true,
      auditLogs: true,
      sla: true,
      whiteLabel: false,
    },
    limits: {
      apiCallsPerMinute: 6000,
      pipelineHoursPerMonth: 72000,
      storageGb: 1000,
    },
    metered: {
      rowsReplicated: {
        freePerDay: 10_000_000,
        perUnit: 20, // $0.20 per 100K rows
        unitSize: 100_000,
      },
      apiCalls: {
        freePerDay: 100_000,
        perUnit: 1,
        unitSize: 100,
      },
      pipelineHours: {
        freePerMonth: 1000,
        perUnit: 3, // $0.03 per hour
      },
      storage: {
        freeGb: 100,
        perGbMonth: 20, // $0.20 per GB/month
      },
    },
  },
};

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId];
}

export function listPlans(): Plan[] {
  return Object.values(PLANS);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
