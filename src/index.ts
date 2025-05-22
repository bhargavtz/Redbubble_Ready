import { Hono } from 'hono';
import type { Context } from 'hono';
import type { ExecutionContext } from '@cloudflare/workers-types';
import { cors } from 'hono/cors';

interface Env {
  NODE_ENV?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('/*', cors());

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Hello from Redbubble Ready API!',
    timestamp: new Date().toISOString()
  });
});

// Metadata generation endpoint
app.post('/api/generate-metadata', async (c) => {
  try {
    const { artworkDataUri } = await c.req.json();
    
    if (!artworkDataUri) {
      return c.json({ 
        error: 'Artwork data URI is required' 
      }, 400);
    }

    // TODO: Implement actual metadata generation
    // For now, return mock data
    return c.json({
      status: 'success',
      data: {
        title: 'Sample Artwork Title',
        description: 'Sample artwork description',
        tags: 'art,digital,sample',
        categories: ['Digital Art']
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    
    return c.json({
      status: 'error',
      message: error.message || 'Internal server error',
    }, 500);
  }
});

app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({
    status: 'error',
    message: 'Internal server error',
  }, 500);
});

export default app;
