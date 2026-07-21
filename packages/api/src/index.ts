// Pulsyn API Server
// REST API for pipeline management

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { pipelineRoutes } from './routes/pipelines';
import { connectorRoutes } from './routes/connectors';
import { healthRoutes } from './routes/health';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/connectors', connectorRoutes);

// OpenAPI spec endpoint
app.get('/api/openapi.json', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Pulsyn API',
      version: '0.1.0',
      description: 'The AI-Native CDC Platform API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local development server',
      },
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Healthy',
            },
          },
        },
      },
      '/api/pipelines': {
        get: {
          summary: 'List pipelines',
          responses: {
            '200': {
              description: 'List of pipelines',
            },
          },
        },
        post: {
          summary: 'Create pipeline',
          responses: {
            '201': {
              description: 'Pipeline created',
            },
          },
        },
      },
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Pulsyn API] Server running on port ${PORT}`);
  console.log(`[Pulsyn API] OpenAPI spec: http://localhost:${PORT}/api/openapi.json`);
});

export default app;
