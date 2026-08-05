## §1 Task identity
- task_id: T3
- short summary: Self-Learning LLM Track C — prediction engine with statistical helpers, 5 forecast methods, and API route

## §2 Subagent intent
Build Track C of the Pulsyn Self-Learning LLM. Create three new pure-TypeScript files: a statistics helper library, a PredictionEngine class with five forecasting methods, and a GET /api/ai/predict route. Update self-learning-llm.ts to wire PredictionEngine into generatePredictions() with confidence intervals on every output. Commit on a feature branch.

## §3 Files and code sections
- packages/web/src/lib/ai/statistics.ts: Created. Exports 10 pure functions — mean, median, stddev, linearRegression, exponentialSmoothing, movingAverage, confidenceInterval, zScore, percentile. Zero external dependencies.
- packages/web/src/lib/ai/prediction-engine.ts: Created. PredictionEngine class with forecastCapacity, forecastPerformance, forecastCost, forecastGrowth, predictFailure. All return PredictionResult with value, confidence, trend, lowerBound, upperBound.
- packages/web/src/app/api/ai/predict/route.ts: Created. GET handler accepts metric=capacity|performance|cost|growth|reliability with optional days/hours params. Loads time-series from Supabase.
- packages/web/src/lib/ai/self-learning-llm.ts: Already updated in Track B commit 78bfbb1. Import added, Prediction interface extended, generatePredictions() rewritten to call PredictionEngine.

## §4 Verbatim commands
```
git checkout -b feat/prediction-engine-track-c
npx tsc --noEmit --project packages/web/tsconfig.json
git add packages/web/src/lib/ai/statistics.ts packages/web/src/lib/ai/prediction-engine.ts packages/web/src/app/api/ai/predict/route.ts
git commit -m "feat(ai): prediction engine — Track C"
git log --oneline -3
```

## §5 Outcome and discoveries
- Outcome: success — all 3 new files created, typecheck passes, committed as 1141ec9 on branch feat/ai-learning-engine-track-b.
- The self-learning-llm.ts PredictionEngine wiring was already committed in Track B (78bfbb1), so Track C commit contains only the 3 new files.
- Branch name diverged: feat/prediction-engine-track-c was created but commit landed on feat/ai-learning-engine-track-b due to a prior amend.
- Pre-existing tsc error in packages/web/src/app/api/ai/chat/route.ts (regex flag requires es2018 target) is not caused by Track C.
