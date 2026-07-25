// Pulsyn Billing Plans
// Tiered SaaS pricing definitions

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  currency: string;
  interval: 'month' | 'year';
  stripePriceId?: string;
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
  mcpServer: boolean;
  apiAccess: boolean;
  webDashboard: boolean;
  prioritySupport: boolean;
  sso: boolean;
  auditLogs: boolean;
  sla: boolean;
}

export interface PlanLimits {
  apiCallsPerMinute: number;
  pipelineHoursPerMonth: number;
  storageGb: number;
}

export interface MeteredPricing {
  rowsReplicated: {
    freePerDay: number;
    perUnit: number;
    unitSize: number;
  };
  apiCalls: {
    freePerDay: number;
    perUnit: number;
    unitSize: number;
  };
}

export const PLANS: Record<string, Plan> = {
  community: {
    id: 'community',
    name: 'Community',
    description: 'For individual developers exploring CDC',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: {
      maxPipelines: 3,
      maxRowsPerDay: 50_000,
      maxConnectors: 3,
      masking: false,
      checkpointRecovery: true,
      mcpServer: false,
      apiAccess: false,
      webDashboard: false,
      prioritySupport: false,
      sso: false,
      auditLogs: false,
      sla: false,
    },
    limits: {
      apiCallsPerMinute: 30,
      pipelineHoursPerMonth: 720,
      storageGb: 1,
    },
    metered: {
      rowsReplicated: { freePerDay: 10_000, perUnit: 100, unitSize: 100_000 },
      apiCalls: { freePerDay: 500, perUnit: 2, unitSize: 100 },
    },
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams running production pipelines',
    price: 30000, // $300/mo
    currency: 'usd',
    interval: 'month',
    features: {
      maxPipelines: 999, // unlimited
      maxRowsPerDay: 5_000_000,
      maxConnectors: 999, // all
      masking: true,
      checkpointRecovery: true,
      mcpServer: true,
      apiAccess: true,
      webDashboard: true,
      prioritySupport: true,
      sso: false,
      auditLogs: false,
      sla: false,
    },
    limits: {
      apiCallsPerMinute: 600,
      pipelineHoursPerMonth: 7200,
      storageGb: 100,
    },
    metered: {
      rowsReplicated: { freePerDay: 500_000, perUnit: 30, unitSize: 100_000 },
      apiCalls: { freePerDay: 10_000, perUnit: 1, unitSize: 100 },
    },
  },

  business: {
    id: 'business',
    name: 'Business',
    description: 'For production workloads with SLA requirements',
    price: 200000, // $2,000/mo
    currency: 'usd',
    interval: 'month',
    features: {
      maxPipelines: 999,
      maxRowsPerDay: 100_000_000,
      maxConnectors: 999,
      masking: true,
      checkpointRecovery: true,
      mcpServer: true,
      apiAccess: true,
      webDashboard: true,
      prioritySupport: true,
      sso: true,
      auditLogs: true,
      sla: true,
    },
    limits: {
      apiCallsPerMinute: 6000,
      pipelineHoursPerMonth: 72000,
      storageGb: 1000,
    },
    metered: {
      rowsReplicated: { freePerDay: 10_000_000, perUnit: 15, unitSize: 100_000 },
      apiCalls: { freePerDay: 100_000, perUnit: 0.5, unitSize: 100 },
    },
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom pricing for large organizations',
    price: 0, // Custom — contact sales
    currency: 'usd',
    interval: 'month',
    features: {
      maxPipelines: 999,
      maxRowsPerDay: 999_999_999,
      maxConnectors: 999,
      masking: true,
      checkpointRecovery: true,
      mcpServer: true,
      apiAccess: true,
      webDashboard: true,
      prioritySupport: true,
      sso: true,
      auditLogs: true,
      sla: true,
    },
    limits: {
      apiCallsPerMinute: 60000,
      pipelineHoursPerMonth: 720000,
      storageGb: 10000,
    },
    metered: {
      rowsReplicated: { freePerDay: 100_000_000, perUnit: 5, unitSize: 100_000 },
      apiCalls: { freePerDay: 1_000_000, perUnit: 0.1, unitSize: 100 },
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
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toLocaleString()}`;
}
