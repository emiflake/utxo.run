/**
 * A simple proxy server for the fine-tx app
 *
 * When running under docker, we would like to proxy requests to the betterfrost and ogmios services,
 * but we don't want to run vite in the container. Additionally, we would like to build the app
 * when the container is built.
 *
 * Bun.serve is perfectly suited for this task.
 */

import * as Bun from 'bun';
import * as path from 'path';

const distDir = process.env.PROXY_DIST_DIR || './dist';

type RewriteRule = {
  from: RegExp;
  to: string;
};

// Proxy a request to a target URL
const proxyTo = (
  req: Request,
  rewriteRule: RewriteRule,
  targetUrl: string,
): Promise<Response> => {
  const originalPath = new URL(req.url).pathname;
  const proxiedUrl = new URL(
    originalPath.replace(rewriteRule.from, rewriteRule.to),
    targetUrl,
  );
  return Bun.fetch(proxiedUrl, req);
};

const isAsset = (pathname: string): boolean => {
  return !!pathname.match(/\.(svg|png|jpg|jpeg|gif?)$/);
};

const server = Bun.serve({
  port: Number(process.env.PORT) || 5173,
  hostname: '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url);

    const handle = async () => {
      // GET /betterfrost/**
      // Proxy to betterfrost
      if (url.pathname.startsWith('/betterfrost')) {
        if (!process.env.VITE_BETTERFROST_URL) {
          throw new Error('Missing environment variable: VITE_BETTERFROST_URL');
        }
        return proxyTo(
          req,
          { from: /^\/betterfrost/, to: '' },
          process.env.VITE_BETTERFROST_URL,
        );
      }
      // GET /ogmios/**
      // Proxy to ogmios
      else if (url.pathname.startsWith('/ogmios')) {
        if (!process.env.VITE_OGMIOS_URL) {
          throw new Error('Missing environment variable: VITE_OGMIOS_URL');
        }
        return proxyTo(
          req,
          { from: /^\/ogmios/, to: '' },
          process.env.VITE_OGMIOS_URL,
        );
      }
      // GET /assets/**
      // Serve asset from './dist'
      else if (url.pathname.startsWith('/assets') || isAsset(url.pathname)) {
        return new Response(Bun.file(path.join(distDir, url.pathname)));
      }
      // GET /**
      // Serve the app. This means that implicitly, any other request is a GET request for a page.
      // This means that 404s will never be returned, but the app will handle the 404s.
      else {
        return new Response(Bun.file(path.join(distDir, '/index.html')));
      }
    };

    const t0 = performance.now();

    const handled = await handle();

    const t1 = performance.now();

    console.log(
      `${req.method} ${url.pathname} -> ${handled?.status} (handled in ${(t1 - t0).toFixed(2)}ms)`,
    );

    return handled;
  },
});

console.log(`
    Proxy started on ${server.url} 🚀

    Requests for /betterfrost => ${process.env.VITE_BETTERFROST_URL}
    Requests for /ogmios      => ${process.env.VITE_OGMIOS_URL}
    Requests for assets       => ${path.join(distDir)}
    Any other request         => ${path.join(distDir, '/index.html')}
`);
