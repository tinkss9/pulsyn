// Pulsyn Core
// The AI-Native CDC Platform

export * from './types';
export * from './api-client';
export * from './benchmark/engine';
export * from './benchmark/runner';
export * from './connectors/base';
export * from './connectors/postgresql';
export * from './connectors/mysql';
export * from './engine/cdc-engine';
export * from './checkpoint/checkpoint-manager';

// Version
export const VERSION = '0.1.0';

// Brand
export const BRAND = {
  name: 'Pulsyn',
  tagline: 'The AI-Native CDC Platform',
  description: 'Real-time change data capture without the complexity',
};
