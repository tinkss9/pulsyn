## §1 Task identity
- task_id: T2
- short summary: Self-Learning LLM — Track B: Learning Engine (snapshots, trends, patterns, anomaly detection, API routes)

## §2 Subagent intent
Build Track B of the Pulsyn Self-Learning LLM system. Create a LearningEngine class that records metric snapshots, detects trends via linear regression, learns patterns from history, and manages anomaly baselines. Create an AnomalyDetector class with z-score detection (|z|>2.5), trend anomaly detection, and cluster detection — all pure TypeScript with no ML libs. Create a Supabase migration with three tables (ai_learning_snapshots, ai_patterns, ai_anomaly_baselines). Add three new API route files for POST /api/ai/learn/snapshot, GET /api/ai/learn/history, and GET /api/ai/learn/patterns while keeping the existing GET /api/ai/learn untouched. Work on a feature branch and commit as feat(ai): learning engine — Track B.

## §3 Files and code sections
- `packages/web/src/lib/ai/learning-engine.ts`: Created LearningEngine class — recordSnapshot() inserts into ai_learning_snapshots, getHistory() queries by resourceType/resourceId/days, detectTrendsFromValues() does linear regression with slope classification, learnPatterns() extracts trend+cyclic patterns and persists to ai_patterns, getAnomalyBaseline()/updateAnomalyBaseline() manage mean/stddev per metric. Uses Array.from() for Set iteration (tsconfig compatibility). Singleton via getLearningEngine().
- `packages/web/src/lib/ai/anomaly-detector.ts`: Created AnomalyDetector class — updateBaseline() computes mean/stddev from values array, detectAnomaly() returns z-score result with severity (warning at |z|>2.5, critical at |z|>3.5), detectTrendAnomaly() compares recent vs historical half-slopes for divergence, clusterAnomalies() groups 3+ anomalies per metric. Uses Array.from() for Map iteration.
- `scripts/learning-tables.sql`: Supabase migration — ai_learning_snapshots (id, org_id, resource_type, resource_id, metrics jsonb, recorded_at) with lookup index, ai_patterns (id, org_id, pattern_type, pattern_data jsonb, confidence, last_seen, created_at) with lookup index, ai_anomaly_baselines (id, org_id, metric_name, mean, stddev, sample_count, updated_at) with UNIQUE(org_id, metric_name) for upsert.
- `packages/web/src/app/api/ai/learn/snapshot/route.ts`: POST handler — validates orgId/resourceType/resourceId/metrics, calls engine.recordSnapshot(), returns snapshotId.
- `packages/web/src/app/api/ai/learn/history/route.ts`: GET handler — reads resourceType/resourceId/days from searchParams, calls engine.getHistory(), returns snapshots array.
- `packages/web/src/app/api/ai/learn/patterns/route.ts`: GET handler — reads orgId/patternType from searchParams, calls engine.getPatterns(), returns patterns array.
- `packages/web/src/app/api/ai/learn/route.ts`: NOT modified — existing GET/POST handlers for feedback and AI insights remain untouched.

## §4 Verbatim commands
```
git checkout -b feat/ai-learning-engine-track-b
npx tsc --noEmit --pretty
git add packages/web/src/lib/ai/learning-engine.ts packages/web/src/lib/ai/anomaly-detector.ts scripts/learning-tables.sql packages/web/src/app/api/ai/learn/snapshot/route.ts packages/web/src/app/api/ai/learn/history/route.ts packages/web/src/app/api/ai/learn/patterns/route.ts
git commit -m "feat(ai): learning engine — Track B"
```

## §5 Outcome and discoveries
- Outcome: success — all 6 files created, typecheck passes with zero errors in new files, committed as 78bfbb1 on feat/ai-learning-engine-track-b branch.
- Discoveries that may matter for other tasks:
  - tsconfig target does not enable `--downlevelIteration`; Map/Set iteration requires `Array.from()` wrapper to avoid TS2802 errors.
  - The `query()` helper from `@/lib/db` uses Supabase RPC `_pulsyn_exec` with all params stringified; JSONB columns need `JSON.stringify` on write and `JSON.parse` on read.
  - `ai_anomaly_baselines` has `UNIQUE(org_id, metric_name)` enabling `ON CONFLICT ... DO UPDATE` upserts — other tracks building baseline refresh logic should use this constraint.
  - The parallel Track A commit (6c20610) on `feat/ai-dashboard-track-d` includes identical versions of these files; when merging tracks, no conflict expected on these files but watch for duplicate content.
  - The branch diverges from `feat/ai-dashboard-track-d` at commit 0a0ef2b; a merge or rebase will be needed to combine Track B with Tracks A/C/D.
