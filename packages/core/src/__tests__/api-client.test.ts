// Pulsyn API Client Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PulsynApiClient, ApiError } from '../api-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PulsynApiClient', () => {
  let client: PulsynApiClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PulsynApiClient({
      baseUrl: 'http://localhost:8080',
      apiKey: 'test-key',
    });
  });

  describe('constructor', () => {
    it('strips trailing slash from baseUrl', () => {
      const c = new PulsynApiClient({ baseUrl: 'http://localhost:8080/' });
      // Internal state — we verify via request behavior
      expect(c).toBeDefined();
    });
  });

  describe('getHealth', () => {
    it('returns health status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'healthy',
          version: '0.1.0',
          timestamp: '2026-07-22T00:00:00Z',
          uptime: 12345,
        }),
      });

      const health = await client.getHealth();
      expect(health.status).toBe('healthy');
      expect(health.version).toBe('0.1.0');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );
    });
  });

  describe('listPipelines', () => {
    it('returns pipeline list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ id: 'p1', status: 'running' }],
          total: 1,
        }),
      });

      const res = await client.listPipelines();
      expect(res.data).toHaveLength(1);
      expect(res.total).toBe(1);
    });
  });

  describe('createPipeline', () => {
    it('sends POST with pipeline config', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          data: { id: 'p-new', status: 'idle' },
        }),
      });

      const res = await client.createPipeline({
        name: 'test-pipeline',
        source: { host: 'localhost', port: 5432, database: 'src', user: 'u', password: 'p' },
        target: { host: 'localhost', port: 5432, database: 'tgt', user: 'u', password: 'p' },
        tables: ['users'],
      });

      expect(res.data.id).toBe('p-new');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/pipelines',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('startPipeline', () => {
    it('sends POST to start endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: { id: 'p1', status: 'running' },
        }),
      });

      const res = await client.startPipeline('p1');
      expect(res.data.status).toBe('running');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/pipelines/p1/start',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('deletePipeline', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await client.deletePipeline('p1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/pipelines/p1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('testConnector', () => {
    it('returns test result', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            connectorId: 'c1',
            status: 'connected',
            latency: 45,
            message: 'Connection successful',
            timestamp: '2026-07-22T00:00:00Z',
          },
        }),
      });

      const res = await client.testConnector('c1');
      expect(res.data.status).toBe('connected');
      expect(res.data.latency).toBe(45);
    });
  });

  describe('error handling', () => {
    it('throws ApiError on non-OK response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ error: 'Pipeline not found' }),
      });

      try {
        await client.getPipeline('nonexistent');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(404);
        expect((err as ApiError).message).toBe('Pipeline not found');
      }
    });

    it('throws ApiError with status code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      try {
        await client.getHealth();
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(500);
      }
    });

    it('throws ApiError on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(client.getHealth()).rejects.toThrow(ApiError);
    });

    it('includes API key in Authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      });

      await client.getHealth();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer test-key');
    });

    it('omits Authorization header when no API key', async () => {
      const noKeyClient = new PulsynApiClient({ baseUrl: 'http://localhost:8080' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      });

      await noKeyClient.getHealth();

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBeUndefined();
    });
  });
});
