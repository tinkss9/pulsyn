═══════════════════════════════════════════════════════════════
  HOW AI AGENTS USE PULSYN MCP
═══════════════════════════════════════════════════════════════

1. CLAUDE / GPT / GEMINI Configuration:
   
   Add to your AI agent's MCP config:
   
   {
     "mcpServers": {
       "pulsyn": {
         "command": "node",
         "args": ["packages/mcp/dist/index.js"],
         "env": {
           "PULSYN_API_URL": "https://pulsyn.vercel.app",
           "PULSYN_API_KEY": "your-api-key"
         }
       }
     }
   }

2. NATURAL LANGUAGE COMMANDS:
   
   "Set up MySQL to PostgreSQL replication for orders table"
   → AI Agent calls: puls_connect, puls_create_pipeline, puls_start_pipeline
   
   "Show me replication lag for all pipelines"
   → AI Agent calls: puls_list_pipelines, puls_get_metrics
   
   "Suggest column mappings between these schemas"
   → AI Agent calls: puls_suggest_mapping
   
   "Validate data quality on pipeline-123"
   → AI Agent calls: puls_validate_data
   
   "Run certification benchmark on PostgreSQL connector"
   → AI Agent calls: puls_certify_connector

3. AGENT-TO-AGENT (A2A) PROTOCOL:
   
   {
     "agentId": "pulsyn-cdc",
     "skills": ["replication", "cdc", "data-sync"],
     "endpoints": {
       "createPipeline": "puls_create_pipeline",
       "startReplication": "puls_start_pipeline",
       "getMetrics": "puls_get_metrics"
     }
   }

4. MCP TOOLS AVAILABLE TO AI AGENTS:
   
   CONNECTION (3 tools):
   • puls_connect — Create database connector
   • puls_disconnect — Remove connector
   • puls_test_connection — Verify connectivity
   
   DISCOVERY (3 tools):
   • puls_discover_tables — List tables
   • puls_discover_schema — Get column definitions
   • puls_sample_data — Sample rows
   
   AI MAPPING (3 tools):
   • puls_suggest_mapping — AI column matching
   • puls_infer_types — Type detection
   • puls_resolve_conflicts — Schema conflict resolution
   
   SYNC (4 tools):
   • puls_create_pipeline — Create replication
   • puls_start_pipeline — Start CDC
   • puls_stop_pipeline — Stop CDC
   • puls_get_pipeline_status — Pipeline details
   
   MONITORING (3 tools):
   • puls_get_metrics — Performance metrics
   • puls_get_alerts — Alert history
   • puls_set_alert — Configure alerts
   
   TRANSFORMATION (2 tools):
   • puls_add_transform — Add transform rule
   • puls_add_filter — Add filter rule
   
   VALIDATION (2 tools):
   • puls_validate_data — Quality check
   • puls_get_validation_report — Detailed report
   
   CERTIFICATION (2 tools):
   • puls_certify_connector — Run benchmark
   • puls_get_certification_status — Level requirements
   
   UTILITY (3 tools):
   • puls_list_connectors — List all
   • puls_get_connector_info — Connector details
   • puls_health_check — API health

═══════════════════════════════════════════════════════════════
