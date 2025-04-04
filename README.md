# fine-tx

A feature... fine transaction viewer.

## Dependencies

fine-tx depends on `betterfrost` and `ogmios`. Configure `.env` based on the example `.env.example`.

## proxy server

A proxy server is provided in `proxy.ts`. This can be started with `bun run build-proxy`. It has a number of specific features that are
useful for local devnet deployment.

- Proxy to `betterfrost` and `ogmios`
- Proxy to the registry, with a dynamic registry that can be used to register new policies on the fly
- Serve the assets and site

### Dynamic registry

You can add new policies to the registry by making a POST request to `/registry-proxy/register-policy`:
```sh
curl -X POST \ 
    -H "Content-Type: application/json" \ 
    -d '{"scriptHash": "foo", "name": "bar"}' \ 
    http://0.0.0.0:5173/registry-proxy/register-policy
```

You can see the changes reflected in the registry by making a GET request to `/registry-proxy/registry.json`:

```sh
$ curl -X GET 0.0.0.0:5173/registry-proxy/registry.json | jq '.scriptInfos|last'
{
  "type": "MintingPolicy",
  "name": "bar",
  "tag": "syntheticProxy",
  "scriptHash": "foo",
  "componentName": "bar"
}
```