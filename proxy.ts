/**
 * A simple proxy server for the fine-tx app
 * 
 * When running under docker, we would like to proxy requests to the betterfrost and ogmios services,
 * but we don't want to run vite in the container. Additionally, we would like to build the app
 * when the container is built.
 * 
 * Bun.serve is perfectly suited for this task.
 */

import * as Bun from 'bun'
import * as path from 'path'
import { registrySchema } from './src/registry'
import { z } from 'zod'

const distDir = process.env.PROXY_DIST_DIR || './dist'

type RewriteRule = {
    from: RegExp
    to: string
}

// Proxy a request to a target URL
const proxyTo = (req: Request, rewriteRule: RewriteRule, targetUrl: string): Promise<Response> => {
    const originalPath = new URL(req.url).pathname;
    const proxiedUrl = new URL(originalPath.replace(rewriteRule.from, rewriteRule.to), targetUrl);
    return Bun.fetch(proxiedUrl, req);
}

const isAsset = (pathname: string): boolean => {
    return !!pathname.match(/\.(svg|png|jpg|jpeg|gif?)$/);
}

// A wrapper for the registry, so that we can dynamically register new policies.
// This is useful for local devnet testing. So that we can get rich metadata for policies
// as they are created during tests.
const createRegistryHandler = async () => {
    const baseRegistryUrl = process.env.VITE_REGISTRY_URL || 'https://public.liqwid.finance/v4/'
    const registry = await fetch(`${baseRegistryUrl}/registry.json`).then(res => res.json())
    const parsedRegistry = registrySchema.parse(registry)
    return {
        registry: parsedRegistry,
        registerPolicy: (scriptHash: string, userFriendlyName: string) => {
            parsedRegistry.scriptInfos.push({
                type: 'MintingPolicy',
                name: userFriendlyName,
                tag: 'syntheticProxy',
                scriptHash,
                componentName: userFriendlyName,
            })
        }
    }
}

const registryHandler = await createRegistryHandler()

const server = Bun.serve({
    port: Number(process.env.PORT) || 5173,
    hostname: '0.0.0.0',
    async fetch(req) {
        const url = new URL(req.url)



        const handle = async () => {

            // GET /betterfrost/**
            // Proxy to betterfrost
            if (url.pathname.startsWith('/betterfrost')) {
                if (!process.env.VITE_BETTERFROST_URL) {
                    throw new Error('Missing environment variable: VITE_BETTERFROST_URL')
                }
                return proxyTo(req, { from: /^\/betterfrost/, to: '' }, process.env.VITE_BETTERFROST_URL)
            }
            // GET /ogmios/**
            // Proxy to ogmios
            else if (url.pathname.startsWith('/ogmios')) {
                if (!process.env.VITE_OGMIOS_URL) {
                    throw new Error('Missing environment variable: VITE_OGMIOS_URL')
                }
                return proxyTo(req, { from: /^\/ogmios/, to: '' }, process.env.VITE_OGMIOS_URL)
            }
            // GET /registry-proxy/registry.json
            // Get the registry
            else if (url.pathname.startsWith('/registry-proxy/registry.json')) {
                return new Response(JSON.stringify(registryHandler.registry), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            }
            // POST /registry-proxy/register-policy
            // Register a new policy
            // Request body: { scriptHash: string, name: string }
            else if (url.pathname.startsWith('/registry-proxy/register-policy') && req.method === 'POST') {
                const requestSchema = z.object({
                    scriptHash: z.string(),
                    name: z.string(),
                })
                const reqBody = requestSchema.safeParse(await req.json())
                if (reqBody.success) {
                    registryHandler.registerPolicy(reqBody.data.scriptHash, reqBody.data.name)
                    return new Response(JSON.stringify({ success: true }))
                } else {
                    return new Response(JSON.stringify({ success: false, errors: reqBody.error.errors }), {
                        status: 400
                    })
                }
            }
            // GET /assets/**
            // Serve asset from './dist'
            else if (url.pathname.startsWith('/assets') || isAsset(url.pathname)) {
                return new Response(Bun.file(path.join(distDir, url.pathname)))
            }
            // GET /**
            // Serve the app. This means that implicitly, any other request is a GET request for a page.
            // This means that 404s will never be returned, but the app will handle the 404s.
            else {
                return new Response(Bun.file(path.join(distDir, '/index.html')))
            }

        }

        const t0 = performance.now()    

        const handled = await handle()

        const t1 = performance.now()

        console.log(`${req.method} ${url.pathname} -> ${handled?.status} (handled in ${(t1 - t0).toFixed(2)}ms)`)
        
        return handled
    }
})

console.log(`
    Proxy started on ${server.url} 🚀

    Requests for /betterfrost => ${process.env.VITE_BETTERFROST_URL}
    Requests for /ogmios      => ${process.env.VITE_OGMIOS_URL}
    Requests for assets       => ${path.join(distDir)}
    Any other request         => ${path.join(distDir, '/index.html')}
`)
