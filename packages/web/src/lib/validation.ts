// Input validation helpers for Pulsyn API

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): ValidationError | null {
  if (!email) return { field: 'email', message: 'Email is required' };
  if (email.length > 255) return { field: 'email', message: 'Email must be 255 characters or less' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { field: 'email', message: 'Invalid email format' };
  return null;
}

export function validateName(name: string): ValidationError | null {
  if (!name) return { field: 'name', message: 'Name is required' };
  if (name.length > 100) return { field: 'name', message: 'Name must be 100 characters or less' };
  if (name.trim().length === 0) return { field: 'name', message: 'Name cannot be whitespace' };
  return null;
}

export function validateEngine(engine: string): ValidationError | null {
  if (!engine) return { field: 'engine', message: 'Engine is required' };
  const knownEngines = [
    'postgresql', 'mysql', 'mongodb', 'redis', 'oracle', 'sqlserver', 'mssql',
    'dynamodb', 'cassandra', 'clickhouse', 'elasticsearch', 'bigquery', 'snowflake',
    'supabase', 'planetscale', 'stripe', 'hubspot', 'shopify', 'slack', 'github',
    'notion', 'salesforce', 'amplitude', 'mixpanel', 'epic', 'cerner', 'plaid',
    'mercury', 'canvas-lms', 'salesforce-gov', 'shipbob', 'amadeus',
    'cmc-markets', 'oanda', 'polygon-io', 'alpha-vantage', 'dexscreener', 'binance',
    'coinbase', 'kraken', 'coingecko', 'fxcm', 'ig-group',
    'none', 'custom',
  ];
  if (!knownEngines.includes(engine.toLowerCase())) {
    return { field: 'engine', message: `Unknown engine '${engine}'. Use one of: ${knownEngines.slice(0, 10).join(', ')}, ...` };
  }
  return null;
}

export function validateRequired(value: any, field: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return { field, message: `${field} is required` };
  }
  return null;
}

export function validateObject(value: any, field: string): ValidationError | null {
  if (value !== undefined && value !== null && typeof value !== 'object') {
    return { field, message: `${field} must be an object` };
  }
  return null;
}

export function validateArray(value: any, field: string): ValidationError | null {
  if (value !== undefined && value !== null && !Array.isArray(value)) {
    return { field, message: `${field} must be an array` };
  }
  return null;
}

export function formatValidationErrors(errors: (ValidationError | null)[]): string {
  return errors
    .filter((e): e is ValidationError => e !== null)
    .map(e => `${e.field}: ${e.message}`)
    .join('; ');
}
