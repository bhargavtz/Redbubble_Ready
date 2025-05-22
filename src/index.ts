import { Hono } from 'hono';
import type { Context } from 'hono';
import type { ExecutionContext } from '@cloudflare/workers-types';
import { cors } from 'hono/cors';
import { generateRedbubbleMetadata, type GenerateRedbubbleMetadataInput } from './ai/flows/generate-redbubble-metadata';

// Define environment interface
interface Env {
  NODE_ENV?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('/*', cors());

// Health check endpoint
app.get('/', (c: Context) => {
  return c.json({
    status: 'ok',
    message: 'Hello from Redbubble Ready Worker!',
    timestamp: new Date().toISOString()
  });
});

// Generate metadata endpoint
app.post('/api/generate-metadata', async (c: Context) => {
  try {
    const body = await c.req.json();
    
    if (!body.artworkDataUri) {
      return c.json({ 
        error: 'Artwork data URI is required' 
      }, 400);
    }

    const input: GenerateRedbubbleMetadataInput = {
      artworkDataUri: body.artworkDataUri
    };

    const result = await generateRedbubbleMetadata(input);

    return c.json({
      status: 'success',
      data: result
    });

  } catch (error: any) {
    console.error('Error generating metadata:', error);
    
    return c.json({
      status: 'error',
      message: error.message || 'Failed to generate metadata',
    }, 500);
  }
});

// Error handling middleware
app.onError((err: Error, c: Context) => {
  console.error(`[Error]: ${err.message}`);
  return c.json({
    status: 'error',
    message: 'Internal Server Error'
  }, 500);
});

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      return app.fetch(request);
    } catch (error) {
      console.error('Unhandled error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
