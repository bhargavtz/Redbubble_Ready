import { Hono } from 'hono';
import { handle } from '@hono/node-server/cloudflare-workers';

const app = new Hono();

app.get('/', (c) => {
  return c.json({
    message: 'Hello from Redbubble Ready Worker!'
  });
});

export default {
  async fetch(request: Request, env: any, ctx: any) {
    return handle(app, request);
  },
};
