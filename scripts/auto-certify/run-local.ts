#!/usr/bin/env npx tsx
// Cross-platform wrapper for cert:run-local
// Sets NODE_ENV=test before loading the controller.
process.env.NODE_ENV = 'test';
(async () => {
  await import('./controller');
})();
