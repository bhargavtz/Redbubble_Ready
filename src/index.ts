import { Hono } from 'hono';
import type { Context } from 'hono';
import type { ExecutionContext } from '@cloudflare/workers-types';

// Define environment interface
interface Env {
  NODE_ENV?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Health check endpoint
app.get('/', (c: Context) => {
  return c.json({
    status: 'ok',
    message: 'Hello from Redbubble Ready Worker!',
    timestamp: new Date().toISOString()
  });
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
