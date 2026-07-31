import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root (packages/core -> ../../.env)
config({ path: resolve(process.cwd(), '../../.env') });
