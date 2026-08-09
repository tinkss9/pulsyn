// Shared competition run state
// In production, use a database. For now, in-memory Map.

export interface CompetitionRun {
  runId: string;
  competitorId: string;
  status: 'pending' | 'starting' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  resultsFile?: string;
  error?: string;
}

// Shared in-memory store
export const competitionRuns: Map<string, CompetitionRun> = new Map();
