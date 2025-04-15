# fine-tx

A feature... fine transaction viewer.

## Dependencies

fine-tx depends on `betterfrost` and `ogmios`. Configure `.env` based on the example `.env.example`.

## proxy server

A proxy server is provided in `proxy.ts`. This can be started with `bun run build-proxy`. It has a number of specific features that are
useful for local devnet deployment.

- Proxy to `betterfrost` and `ogmios`
- Proxy to the registry
- Serve the assets and site