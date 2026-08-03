UPDATE pipelines 
SET config = COALESCE(config, '{}'::jsonb) || '{"tableMapping":{"source_users":"target_users"}}'::jsonb 
WHERE id = 'pipeline-1785466759562' 
RETURNING id, config;
