import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import * as z from 'zod';
import { RegistryContext } from './registry_context';
import * as CML from '@dcspark/cardano-multiplatform-lib-browser';

export const otherInfoSchema = z.object({
  agoraTestnetParams: z.unknown(),
  agoraMainnetParams: z.unknown(),
  liqwidTestnetParams: z.unknown(),
  liqwidMainnetParams: z.unknown(),
  oracleTestnetParams: z.unknown(),
  oracleMainnetParams: z.unknown(),
  otherMainnetAssets: z.record(z.unknown()),
  otherTestnetAssets: z.record(z.unknown()),
  coingeckoId: z.record(z.string()).optional(),
  assetMetadata: z.record(z.unknown()),
  marketMetadata: z.record(z.unknown()),
});

export type OtherInfo = z.infer<typeof otherInfoSchema>;

export type ScriptType = 'Validator' | 'MintingPolicy' | 'StakeValidator';

export const scriptInfoSchema = z.object({
  type: z.union([
    z.literal('Validator'),
    z.literal('MintingPolicy'),
    z.literal('StakeValidator'),
  ]),
  name: z.string(),
  tag: z.string(),
  network: z
    .object({
      tag: z.string(),
    })
    .optional(),
  description: z.string().optional(),
  scriptHash: z.string(),
  deployment: z.union([
    z.object({
      type: z.literal('lockedAt'),
      referenceUtxo: z.object({
        output: z.object({
          scriptRef: z.object({
            tag: z.literal('PlutusScriptRef'),
            contents: z.tuple([z.string(), z.literal('PlutusV2')]),
          }),
          output: z.object({
            referenceScript: z.string(),
            datum: z.unknown().optional(),
            address: z.object({
              addressStakingCredential: z.null(),
              addressCredential: z.object({
                tag: z.enum(['ScriptCredential', 'PubKeyCredential']),
                contents: z.string(),
              }),
            }),
          }),
        }),
        input: z.object({
          transactionId: z.string(),
          index: z.number(),
        }),
      }),
    }),
    z.object({
      type: z.literal('notDeployed'),
      version: z.literal('PlutusV2'),
      rawHex: z.string(),
    }),
  ]),
  componentName: z.string().optional(),
  domain: z.unknown().optional(),
  market: z.string().optional(),
});

export type ScriptInfo = z.infer<typeof scriptInfoSchema>;

export const registrySchema = z.object({
  scriptInfos: z.array(scriptInfoSchema),
  other: otherInfoSchema.optional(),
});

export type Registry = z.infer<typeof registrySchema>;

export const getRegistry = async (url: string): Promise<Registry> => {
  const response = await fetch(`${url}`);
  const json = await response.json();

  const res = registrySchema.safeParse(json);
  if (!res.success) {
    console.error(res.error);
  }

  return registrySchema.parse(json);
};

export const registryBaseURL: string = import.meta.env.VITE_REGISTRY_URL;

export const dynamicRegistry = !(
  import.meta.env.VITE_DYN_REGISTRY === 'false' ||
  import.meta.env.VITE_DYN_REGISTRY === 'FALSE'
);

export const useRegistry = () => {
  const registry = useContext(RegistryContext);

  return useQuery({
    queryKey: ['registry', registry?.registryURL],
    queryFn: () =>
      getRegistry(registry?.registryURL || '/registry-proxy/registry.json'),
  });
};

/**
 *
 * @param registry The registry to search in.
 * @param address The address to search for, encoded as bech32.
 * @returns The script info for the given address, or undefined if not found.
 */
export const scriptInfoByAddress = (
  registry: Registry,
  address: string,
): ScriptInfo | undefined => {
  const cmlAddress = CML.Address.from_bech32(address);

  return registry.scriptInfos.find(
    (scriptInfo) =>
      scriptInfo.scriptHash ===
      cmlAddress.payment_cred()?.as_script()?.to_hex(),
  );
};
