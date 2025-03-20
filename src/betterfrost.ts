import { useQuery } from "@tanstack/react-query";
import * as zod from "zod";

export const betterfrostURL = "http://0.0.0.0:7777";

export const transactionSchema = zod.object({
  index: zod.number(),
  hash: zod.string(),
  block: zod.string(),
  block_height: zod.number(),
  block_time: zod.number(),
  slot: zod.number(),
  size: zod.number(),
  output_amount: zod.array(zod.unknown()),
  fees: zod.string(),
  deposit: zod.string().nullable(),
  valid_contract: zod.boolean(),
  invalid_before: zod.string().nullable(),
  invalid_hereafter: zod.string().nullable(),
  utxo_count: zod.number(),
  withdrawal_count: zod.number(),
  mir_cert_count: zod.number(),
  delegation_count: zod.number(),
  stake_cert_count: zod.number(),
  pool_update_count: zod.number(),
  pool_retire_count: zod.number(),
  asset_mint_or_burn_count: zod.number(),
  redeemer_count: zod.number(),
});

export type Transaction = zod.infer<typeof transactionSchema>;

export const transactionAmountSchema = zod.object({
  unit: zod.string(),
  quantity: zod.string(),
});

export type TransactionAmount = zod.infer<typeof transactionAmountSchema>;

export const transactionInputSchema = zod.object({
  address: zod.string().nullable(),
  tx_in_id: zod.number().nullable().optional(),
  tx_hash: zod.string().nullable(),
  output_index: zod.number().nullable(),
  reference_script_hash: zod.string().nullable(),
  amount: zod.array(transactionAmountSchema).nullable(),
  data_hash: zod.string().nullable(),
  inline_datum: zod.string().nullable(),
  collateral: zod.boolean().nullable(),
  reference: zod.boolean().nullable(),
});

export type TransactionInput = zod.infer<typeof transactionInputSchema>;

export const transactionOutputSchema = zod.object({
  address: zod.string().nullable(),
  consumed_by_tx: zod.string().nullable(),
  output_index: zod.number().nullable(),
  reference_script_hash: zod.string().nullable(),
  amount: zod.array(transactionAmountSchema).nullable(),
  data_hash: zod.string().nullable(),
  inline_datum: zod.string().nullable(),
  collateral: zod.boolean().nullable(),
});

export type TransactionOutput = zod.infer<typeof transactionOutputSchema>;

export const transactionUtxosResponseSchema = zod.object({
  hash: zod.string(),
  inputs: zod.array(transactionInputSchema),
  outputs: zod.array(transactionOutputSchema),
});

export type TransactionUtxosResponse = zod.infer<
  typeof transactionUtxosResponseSchema
>;

export const getTxByHash = async (
  hash: string,
): Promise<Transaction | null> => {
  const response = await fetch(`${betterfrostURL}/api/v0/txs/${hash}`);
  const json = await response.json();

  return transactionSchema.parse(json);
};

export const getTxUtxosByHash = async (
  hash: string,
): Promise<TransactionUtxosResponse> => {
  const response = await fetch(`${betterfrostURL}/api/v0/txs/${hash}/utxos`);
  const json = await response.json();

  try {
    return transactionUtxosResponseSchema.parse(json);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const useTxUtxosByHash = (
  hash: string,
): {
  data: TransactionUtxosResponse | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  return useQuery({
    queryKey: ["tx-utxos", hash],
    queryFn: () => getTxUtxosByHash(hash),
    staleTime: 10_000,
  });
};

export const useTxByHash = (
  hash: string,
): { data: Transaction | undefined; isLoading: boolean; isError: boolean } => {
  return useQuery({
    queryKey: ["tx", hash],
    queryFn: () => getTxByHash(hash),
    staleTime: 10_000,
  });
};
