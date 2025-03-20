import { useQuery } from "@tanstack/react-query";
import * as z from "zod";

export const registryURL = import.meta.env.VITE_REGISTRY_URL;
export const registryJSONURL = `${registryURL}/registry.json`;


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

export type ScriptType = 'Validator' | 'MintingPolicy' | 'StakeValidator'

export const scriptInfoSchema = z.object({
  type: z.union([z.literal('Validator'), z.literal('MintingPolicy'), z.literal('StakeValidator')]),
  name: z.string(),
  tag: z.string(),
  network: z.object({
    tag: z.string(),
  }),
  description: z.string(),
  scriptHash: z.string(),
  deployment: z.unknown(),
  componentName: z.string(),
  domain: z.unknown(),
  market: z.string().optional(),
});

export type ScriptInfo = z.infer<typeof scriptInfoSchema>;

export const registrySchema = z.object({
  scriptInfos: z.array(scriptInfoSchema),
  other: otherInfoSchema,
});

export type Registry = z.infer<typeof registrySchema>;

export const getRegistry = async (): Promise<Registry> => {
  const response = await fetch(`${registryURL}/registry.json`);
  const json = await response.json();

  const res = registrySchema.safeParse(json);
  if (!res.success) {
    console.error(res.error);
  }

  return registrySchema.parse(json);
};


export const useRegistry = () => {
  return useQuery({
    queryKey: ["registry"],
    queryFn: () => getRegistry(),
    staleTime: 60_000,
  });
};
