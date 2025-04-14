/**
 * A simple proxy server for the fine-tx app
 *
 * When running under docker, we would like to proxy requests to the betterfrost and ogmios services,
 * but we don't want to run vite in the container. Additionally, we would like to build the app
 * when the container is built.
 *
 * This implementation uses Hono for a more structured approach to routing.
 */

import { Hono } from 'hono';
import { proxy } from 'hono/proxy';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import * as path from 'path';
import convict from 'convict';

const config = convict({
    port: {
        doc: 'The port to bind the proxy server to',
        format: 'port',
        default: 3900,
        env: 'PORT',
    },
    distDir: {
        doc: 'Directory containing built static files',
        format: String,
        default: './dist',
        env: 'PROXY_DIST_DIR',
    },
    betterfrostUrl: {
        doc: 'URL for the Betterfrost API',
        format: String,
        default: 'http://0.0.0.0:3001',
        env: 'VITE_BETTERFROST_URL',
    },
    ogmiosUrl: {
        doc: 'URL for the Ogmios service',
        format: String,
        default: 'http://0.0.0.0:1337',
        env: 'VITE_OGMIOS_URL',
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

// Proxy routes
app.all('/betterfrost/*', async (c) => {
    const targetUrl = c.req.path.replace('/betterfrost', '');
    return proxy(`${config.get('betterfrostUrl')}${targetUrl}`, {
        ...c.req
    })
});

app.all('/ogmios/*', async (c) => {
    const targetUrl = c.req.path.replace('/ogmios', '');

    return proxy(`${config.get('ogmiosUrl')}${targetUrl}`, {
        ...c.req
    })
});

app.all('/ogmios/:path', async (c) => {
    console.log(`Proxying to ${config.get('ogmiosUrl')}/${c.req.param('path')}`);
    return proxy(`${config.get('ogmiosUrl')}/${c.req.param('path')}`, {
        headers: {
            ...c.req.header()
        },
    })
});


app.get('/registry-proxy/:path', async (c) => {
    return proxy(`${config.get('registryUrl')}/${c.req.param('path')}`)
});

app.get('/assets/*', serveStatic({ root: config.get('distDir') }));

app.use(':file.svg', serveStatic({ root: config.get('distDir') }));
app.use(':file.png', serveStatic({ root: config.get('distDir') }));
app.use(':file.jpg', serveStatic({ root: config.get('distDir') }));
app.use(':file.ico', serveStatic({ root: config.get('distDir') }));
app.use(':file.json', serveStatic({ root: config.get('distDir') }));
app.use(':file.js', serveStatic({ root: config.get('distDir') }));
app.use(':file.css', serveStatic({ root: config.get('distDir') }));



// // SPA fallback - must be last as it's the catch-all
app.get('*', async (c) => {
    const file = Bun.file(path.join(config.get('distDir'), '/index.html'));
    const content = await file.text();
    return c.html(content);
});



console.log(`
    Proxy started on http://0.0.0.0:${config.get('port')} 🚀

    Requests for /betterfrost    => ${config.get('betterfrostUrl')}
    Requests for /ogmios         => ${config.get('ogmiosUrl')}
    Requests for /registry-proxy => ${config.get('registryUrl')}
    Requests for assets          => ${path.join(config.get('distDir'))}
    Any other request            => ${path.join(config.get('distDir'), '/index.html')}
`);

// Start the server
export default {
    port: config.get('port'),
    fetch: app.fetch,
}