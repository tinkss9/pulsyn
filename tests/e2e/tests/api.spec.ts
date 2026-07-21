import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:8080';

test.describe('API Health', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.version).toBe('0.1.0');
  });

  test('should return ready status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health/ready`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ready');
  });
});

test.describe('Pipelines API', () => {
  test('should list pipelines', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/pipelines`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data).toBeInstanceOf(Array);
    expect(data.total).toBe(0);
  });

  test('should create a pipeline', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/pipelines`, {
      data: {
        name: 'Test Pipeline',
        source: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        target: {
          host: 'localhost',
          port: 3306,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        tables: ['users', 'orders'],
      },
    });
    
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data.data.name).toBe('Test Pipeline');
    expect(data.data.status).toBe('idle');
  });

  test('should get pipeline by ID', async ({ request }) => {
    // First create a pipeline
    const createResponse = await request.post(`${API_BASE}/api/pipelines`, {
      data: {
        name: 'Get Pipeline',
        source: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        target: {
          host: 'localhost',
          port: 3306,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        tables: ['users'],
      },
    });
    
    const { data: created } = await createResponse.json();
    
    // Then get it
    const response = await request.get(`${API_BASE}/api/pipelines/${created.id}`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data.id).toBe(created.id);
  });

  test('should start a pipeline', async ({ request }) => {
    // Create pipeline
    const createResponse = await request.post(`${API_BASE}/api/pipelines`, {
      data: {
        name: 'Start Pipeline',
        source: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        target: {
          host: 'localhost',
          port: 3306,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        tables: ['users'],
      },
    });
    
    const { data: created } = await createResponse.json();
    
    // Start it
    const response = await request.post(`${API_BASE}/api/pipelines/${created.id}/start`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data.status).toBe('running');
  });

  test('should stop a pipeline', async ({ request }) => {
    // Create and start pipeline
    const createResponse = await request.post(`${API_BASE}/api/pipelines`, {
      data: {
        name: 'Stop Pipeline',
        source: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        target: {
          host: 'localhost',
          port: 3306,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        tables: ['users'],
      },
    });
    
    const { data: created } = await createResponse.json();
    await request.post(`${API_BASE}/api/pipelines/${created.id}/start`);
    
    // Stop it
    const response = await request.post(`${API_BASE}/api/pipelines/${created.id}/stop`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data.status).toBe('idle');
  });

  test('should delete a pipeline', async ({ request }) => {
    // Create pipeline
    const createResponse = await request.post(`${API_BASE}/api/pipelines`, {
      data: {
        name: 'Delete Pipeline',
        source: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        target: {
          host: 'localhost',
          port: 3306,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
        tables: ['users'],
      },
    });
    
    const { data: created } = await createResponse.json();
    
    // Delete it
    const response = await request.delete(`${API_BASE}/api/pipelines/${created.id}`);
    expect(response.status()).toBe(204);
    
    // Verify it's gone
    const getResponse = await request.get(`${API_BASE}/api/pipelines/${created.id}`);
    expect(getResponse.status()).toBe(404);
  });
});

test.describe('Connectors API', () => {
  test('should list connectors', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/connectors`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data).toBeInstanceOf(Array);
  });

  test('should create a connector', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/connectors`, {
      data: {
        name: 'Test PostgreSQL',
        engine: 'postgresql',
        config: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
      },
    });
    
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data.data.name).toBe('Test PostgreSQL');
    expect(data.data.engine).toBe('postgresql');
  });

  test('should test connector connection', async ({ request }) => {
    // Create connector
    const createResponse = await request.post(`${API_BASE}/api/connectors`, {
      data: {
        name: 'Test Connection',
        engine: 'postgresql',
        config: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          user: 'myuser',
          password: 'mypassword',
        },
      },
    });
    
    const { data: created } = await createResponse.json();
    
    // Test connection
    const response = await request.post(`${API_BASE}/api/connectors/${created.id}/test`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data.status).toBe('connected');
  });
});
