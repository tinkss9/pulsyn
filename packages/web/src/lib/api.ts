// Pulsyn Web API Client
// Client-side API wrapper for the Pulsyn API

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers: extraHeaders = {} } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  // Add auth token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pulsyn_api_key');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let errorMessage: string;
    try {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.error || parsed.message || errorBody;
    } catch {
      errorMessage = errorBody;
    }
    throw new ApiError(res.status, errorMessage);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Health
export async function getHealth() {
  return apiRequest<{ status: string; version: string; uptime: number }>('/api/health');
}

// Pipelines
export async function listPipelines() {
  return apiRequest<{ data: any[]; total: number }>('/api/pipelines');
}

export async function getPipeline(id: string) {
  return apiRequest<{ data: any }>(`/api/pipelines/${id}`);
}

export async function createPipeline(input: any) {
  return apiRequest<{ data: any }>('/api/pipelines', { method: 'POST', body: input });
}

export async function deletePipeline(id: string) {
  return apiRequest<void>(`/api/pipelines/${id}`, { method: 'DELETE' });
}

export async function startPipeline(id: string) {
  return apiRequest<{ data: any }>(`/api/pipelines/${id}/start`, { method: 'POST' });
}

export async function stopPipeline(id: string) {
  return apiRequest<{ data: any }>(`/api/pipelines/${id}/stop`, { method: 'POST' });
}

export async function pausePipeline(id: string) {
  return apiRequest<{ data: any }>(`/api/pipelines/${id}/pause`, { method: 'POST' });
}

export async function getPipelineMetrics(id: string) {
  return apiRequest<{ data: any }>(`/api/pipelines/${id}/metrics`);
}

export async function getPipelineCheckpoints(id: string) {
  return apiRequest<{ data: any[]; total: number }>(`/api/pipelines/${id}/checkpoints`);
}

// Connectors
export async function listConnectors() {
  return apiRequest<{ data: any[]; total: number }>('/api/connectors');
}

export async function createConnector(input: any) {
  return apiRequest<{ data: any }>('/api/connectors', { method: 'POST', body: input });
}

export async function deleteConnector(id: string) {
  return apiRequest<void>(`/api/connectors/${id}`, { method: 'DELETE' });
}

export async function testConnector(id: string) {
  return apiRequest<{ data: any }>(`/api/connectors/${id}/test`, { method: 'POST' });
}

export async function getConnectorTables(id: string) {
  return apiRequest<{ data: any[]; total: number }>(`/api/connectors/${id}/tables`);
}

export async function getTableSchema(connectorId: string, table: string) {
  return apiRequest<{ data: any }>(`/api/connectors/${connectorId}/tables/${table}/schema`);
}

// Billing
export async function listPlans() {
  return apiRequest<{ data: any[] }>('/api/billing/plans');
}

export async function getSubscription(orgId: string) {
  return apiRequest<{ data: any }>(`/api/billing/subscriptions/${orgId}`);
}

export async function createSubscription(input: any) {
  return apiRequest<{ data: any }>('/api/billing/subscriptions', { method: 'POST', body: input });
}

export async function getUsage(orgId: string) {
  return apiRequest<{ data: any }>(`/api/billing/usage/${orgId}`);
}

export async function createCheckout(planId: string, email: string, orgId?: string) {
  return apiRequest<{ data: { url: string } }>('/api/billing/checkout', {
    method: 'POST',
    body: { planId, email, organizationId: orgId },
  });
}

export async function getBillingStatus() {
  return apiRequest<{ data: any }>('/api/billing/status');
}

// Auth helpers
export function setApiKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pulsyn_api_key', key);
  }
}

export function getApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pulsyn_api_key');
  }
  return null;
}

export function clearApiKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pulsyn_api_key');
  }
}

export function isAuthenticated(): boolean {
  return !!getApiKey();
}
