// Cloudflare Worker proxy for fine-tx

import { Hono } from 'hono';
import { proxy } from 'hono/proxy';
import { logger } from 'hono/logger';
import convict from 'convict';
import { LRUCache } from 'lru-cache';

const config = convict({
  port: {
    doc: 'The port to bind the proxy server to',
    format: 'port',
    default: 5173,
    env: 'PORT',
  },
  betterfrostUrl: {
    doc: 'URL for the Betterfrost API',
    format: String,
    default: 'http://0.0.0.0:3001',
    env: 'VITE_BETTERFROST_URL',
  },
  blockfrostProjectId: {
    doc: 'Project ID for Blockfrost API (optional, if not using Betterfrost)',
    format: String,
    default: '',
    env: 'VITE_BLOCKFROST_PROJECT_ID',
  },
  cacheSize: {
    doc: 'Size of the cache in bytes',
    format: Number,
    default: 0,
    env: 'PROXY_CACHE_SIZE',
  },
  registryUrl: {
    doc: 'URL for the token registry service',
    format: String,
    default: 'https://public.liqwid.finance/v4',
    env: 'VITE_REGISTRY_URL',
  },
});

config.validate({ allowed: 'strict' });

const app = new Hono();

app.use(logger());

const cache = new LRUCache<string, Blob>({
  max: config.get('cacheSize'),
  ttl: 60 * 30 * 1000,
});

function key(url: string, options: RequestInit) {
  return `${url}-${options.body}`;
}

async function betterfrostProxy(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const k = key(url, options);
  const cachedResponse = cache.get(k);
  if (cachedResponse) {
    console.log(`--> CACHE HIT ${k}`);
    return new Response(cachedResponse);
  }

  console.log(`--> CACHE MISS ${k}`);

  const response = await proxy(url, {
    ...options,
  });

  const blob = await response.blob();

  console.log(`--> CACHE SET ${k} (${blob.size} bytes)`);

  const res = new Response(blob);

  cache.set(k, blob);

  return res;
}

// Proxy routes
app.all('/betterfrost/*', async (c) => {
  const targetUrl = c.req.path.replace('/betterfrost', '');

  const extraHeaders = config.get('blockfrostProjectId')
    ? ({
        project_id: config.get('blockfrostProjectId') ?? '',
      } as Record<string, string>)
    : {};

  const response = await betterfrostProxy(
    `${config.get('betterfrostUrl')}${targetUrl}`,
    {
      method: c.req.method,
      body: c.req.raw.body,
      headers: {
        ...c.req.raw.headers,
        'User-Agent': c.req.raw.headers['User-Agent'],
        ...extraHeaders,
      },
    },
  );

  return response;
});

app.all('/ogmios/*', async (c) => {
  return c.json({ error: 'OGMIOS_URL not set. Not available!' });
});

app.get('/registry-proxy/:path', async (c) => {
  return proxy(`${config.get('registryUrl')}/${c.req.param('path')}`);
});

console.log(`
    Proxy started on http://0.0.0.0:${config.get('port')} 🚀

    Requests for /betterfrost    => ${config.get('betterfrostUrl')}
    Requests for /ogmios         => Not available
    Requests for /registry-proxy => ${config.get('registryUrl')}
`);

// Start the server
export default {
  port: config.get('port'),
  fetch: app.fetch,
};
