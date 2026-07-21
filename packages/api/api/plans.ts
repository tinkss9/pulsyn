import type { VercelRequest, VercelResponse } from '@vercel/node';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For freelancers and solopreneurs',
    price: 9900,
    priceFormatted: '$99.00',
    interval: 'month',
    features: { maxPipelines: 1, maxRowsPerDay: 100000, maxConnectors: 5, masking: false, sso: false },
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For mid-market teams',
    price: 49900,
    priceFormatted: '$499.00',
    interval: 'month',
    features: { maxPipelines: 10, maxRowsPerDay: 1000000, maxConnectors: 999, masking: true, sso: false },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 249900,
    priceFormatted: '$2,499.00',
    interval: 'month',
    features: { maxPipelines: 999, maxRowsPerDay: 100000000, maxConnectors: 999, masking: true, sso: true },
  },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ data: PLANS });
}
