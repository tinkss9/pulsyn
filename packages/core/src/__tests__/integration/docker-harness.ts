// @ts-nocheck
// Docker test harness — utility to check if Docker containers are running
// Used by integration tests to skip if required services aren't available

import { execSync } from 'child_process';
import { resolve } from 'path';

/**
 * Check if a specific Docker Compose service is running.
 * Uses the test docker-compose file at project root.
 */
export function isServiceRunning(service: string): boolean {
  try {
    const projectRoot = resolve(__dirname, '../../../../../');
    const result = execSync(
      `docker compose -f docker-compose.test.yml ps ${service} --format json`,
      { encoding: 'utf-8', timeout: 5000, cwd: projectRoot }
    );
    return result.includes('running');
  } catch {
    return false;
  }
}

/**
 * Skip test if the required Docker service isn't running.
 * Throws a descriptive error that vitest will mark as skipped.
 */
export function skipIfNoDocker(service: string): void {
  if (!isServiceRunning(service)) {
    throw new Error(
      `SKIP: ${service} not running. Run: docker compose -f docker-compose.test.yml up -d`
    );
  }
}

/**
 * Wait for a service to be ready by checking TCP connectivity.
 */
export async function waitForService(host: string, port: number, timeoutMs = 10000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const { createConnection } = await import('net');
      const connected = await new Promise<boolean>((resolve) => {
        const socket = createConnection({ host, port }, () => {
          socket.destroy();
          resolve(true);
        });
        socket.on('error', () => { socket.destroy(); resolve(false); });
        socket.setTimeout(1000, () => { socket.destroy(); resolve(false); });
      });
      if (connected) return true;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

/**
 * Get connection config for a test service based on environment or defaults.
 */
export function getTestConfig(service: string): Record<string, any> {
  const configs: Record<string, Record<string, any>> = {
    postgres: {
      host: process.env.TEST_PG_HOST || 'localhost',
      port: parseInt(process.env.TEST_PG_PORT || '5432'),
      database: process.env.TEST_PG_DB || 'testdb',
      username: process.env.TEST_PG_USER || 'test',
      password: process.env.TEST_PG_PASS || 'test',
    },
    mysql: {
      host: process.env.TEST_MYSQL_HOST || 'localhost',
      port: parseInt(process.env.TEST_MYSQL_PORT || '3306'),
      database: process.env.TEST_MYSQL_DB || 'testdb',
      username: process.env.TEST_MYSQL_USER || 'root',
      password: process.env.TEST_MYSQL_PASS || 'test',
    },
    mongodb: {
      host: process.env.TEST_MONGO_HOST || 'localhost',
      port: parseInt(process.env.TEST_MONGO_PORT || '27017'),
      database: process.env.TEST_MONGO_DB || 'testdb',
      username: process.env.TEST_MONGO_USER || 'test',
      password: process.env.TEST_MONGO_PASS || 'test',
    },
    redis: {
      host: process.env.TEST_REDIS_HOST || 'localhost',
      port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
    },
    localstack: {
      host: process.env.TEST_LOCALSTACK_HOST || 'localhost',
      port: parseInt(process.env.TEST_LOCALSTACK_PORT || '4566'),
      region: 'us-east-1',
      endpoint: `http://${process.env.TEST_LOCALSTACK_HOST || 'localhost'}:${process.env.TEST_LOCALSTACK_PORT || '4566'}`,
      accessKeyId: 'test',
      secretAccessKey: 'testtest',
    },
  };
  return configs[service] || {};
}
