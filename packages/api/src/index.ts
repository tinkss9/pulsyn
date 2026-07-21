// Pulsyn API Server
// REST API for pipeline management with OpenAPI docs

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { pipelineRoutes } from './routes/pipelines';
import { connectorRoutes } from './routes/connectors';
import { healthRoutes } from './routes/health';
import { billingRoutes } from './routes/billing';
import { webhookRoutes } from './routes/webhooks';
import { benchmarkRoutes } from './routes/benchmarks';
import { openApiSpec } from './openapi';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow Swagger UI inline styles
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/connectors', connectorRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/benchmarks', benchmarkRoutes);

// OpenAPI spec as JSON
app.get('/api/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

// Swagger UI (served inline — no external CDN dependency)
app.get('/api/docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pulsyn API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-size: 2em; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: 'BaseLayout',
      defaultModelsExpandDepth: 2,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
    });
  </script>
</body>
</html>`);
});

// Redirect root to docs
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// Start server
app.listen(PORT, () => {
  console.log(`[Pulsyn API] Server running on port ${PORT}`);
  console.log(`[Pulsyn API] API docs:    http://localhost:${PORT}/api/docs`);
  console.log(`[Pulsyn API] OpenAPI spec: http://localhost:${PORT}/api/openapi.json`);
});

export default app;
