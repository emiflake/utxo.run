import { useQuery } from "@tanstack/react-query";
import * as zod from "zod";
import * as tx from "./tx";

export const betterfrostURL = import.meta.env.VITE_BETTERFROST_URL;

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

export const blockSchema = zod.object({
  hash: zod.string(),
  time: zod.number(),
  height: zod.number(),
  size: zod.number(),
  slot: zod.number(),
  epoch: zod.number(),
  epoch_slot: zod.number(),
  slot_leader: zod.string(),
  tx_count: zod.number(),
  output: zod.string().nullable(),
  fees: zod.string().nullable(),
  block_vrf: zod.string(),
  op_cert: zod.string(),
  op_cert_counter: zod.string(),
  previous_block: zod.string(),
  next_block: zod.string().nullable(),
  confirmations: zod.number(),
});

export type Block = zod.infer<typeof blockSchema>;

export const assetPolicyTransactionSchema = zod.object({
  address: zod.string(),
  tx_hash: zod.string(),
  tx_index: zod.number(),
  output_index: zod.number(),
  amount: zod.array(transactionAmountSchema),
  block: zod.string(),
  block_slot: zod.number(),
  data_hash: zod.string().nullable(),
  inline_datum: zod.string().nullable(),
  reference_script_hash: zod.string().nullable(),
});

export type AssetPolicyTransaction = zod.infer<
  typeof assetPolicyTransactionSchema
>;

export const addressUtxoSchema = zod.object({
  address: zod.string(),
  block: zod.string(),
  tx_hash: zod.string(),
  tx_index: zod.number(),
  output_index: zod.number(),
  amount: zod.array(transactionAmountSchema),
  data_hash: zod.string().nullable(),
  inline_datum: zod.string().nullable(),
  reference_script_hash: zod.string().nullable(),
});

export type AddressUtxo = zod.infer<typeof addressUtxoSchema>;

export const cborSchema = zod.object({
  cbor: zod.string(),
});

export type Cbor = zod.infer<typeof cborSchema>;

export const getTxsWithPolicyIds = async (
  policyIds: string[],
): Promise<AssetPolicyTransaction[]> => {
  const response = await fetch(`${betterfrostURL}/api/v0/assets/policy/utxos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(policyIds),
  });
  const json = await response.json();

  return assetPolicyTransactionSchema.array().parse(json);
};

export const getCborByDatumHash = async (datumHash: string): Promise<Cbor> => {
  const response = await fetch(
    `${betterfrostURL}/api/v0/scripts/datum/${datumHash}/cbor`,
  );
  const json = await response.json();

  return cborSchema.parse(json);
};

export const getTxCborByHash = async (hash: string): Promise<Cbor> => {
  const response = await fetch(`${betterfrostURL}/api/v0/txs/${hash}/cbor`);
  const json = await response.json();

  return cborSchema.parse(json);
};

export const getLatestBlock = async (): Promise<Block> => {
  const response = await fetch(`${betterfrostURL}/api/v0/blocks/latest`);
  const json = await response.json();

  return blockSchema.parse(json);
};

export const getBlockByHashOrNumber = async (
  hashOrNumber: string,
): Promise<Block> => {
  const response = await fetch(
    `${betterfrostURL}/api/v0/blocks/${hashOrNumber}`,
  );
  const json = await response.json();

  return blockSchema.parse(json);
};

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

export const getUtxosByAddress = async (
  address: string,
): Promise<AddressUtxo[]> => {
  const response = await fetch(
    `${betterfrostURL}/api/v0/addresses/${address}/utxos`,
    {
      method: "GET",
    },
  );
  const json = await response.json();

  return addressUtxoSchema.array().parse(json);
};

export const useUtxosByAddress = (
  address: string,
): {
  data: AddressUtxo[] | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  return useQuery({
    queryKey: ["utxos-by-address", address],
    queryFn: () => getUtxosByAddress(address),
    staleTime: 10_000,
  });
};

export const useTxsWithPolicyIds = (
  policyIds: string[],
): {
  data: AssetPolicyTransaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  return useQuery({
    queryKey: ["txs-with-policy-ids", policyIds],
    queryFn: () => getTxsWithPolicyIds(policyIds),
    staleTime: 10_000,
  });
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

export const useLatestBlock = (): {
  data: Block | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  return useQuery({
    queryKey: ["latest-block"],
    queryFn: () => getLatestBlock(),
    staleTime: 1000,
    refetchInterval: 5000,
  });
};

export const useBlockByHashOrNumber = (
  hashOrNumber: string,
): {
  data: Block | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  return useQuery({
    queryKey: ["block", hashOrNumber],
    queryFn: () => getBlockByHashOrNumber(hashOrNumber),
    staleTime: 10_000,
  });
};

export const useCborByDatumHash = (
  datumHash: string,
): {
  data: string | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  return useQuery({
    queryKey: ["cbor", datumHash],
    queryFn: () => getCborByDatumHash(datumHash).then((cbor) => cbor.cbor),
    staleTime: 10_000,
  });
};

export const useTxData = (
  txHash: string,
): {
  data: tx.Transaction | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  return useQuery({
    queryKey: ["tx-data", txHash],
    queryFn: async () => {
      const cbor = await getTxCborByHash(txHash);
      const result = await tx.processTxFromCbor(cbor.cbor);
      if (result.success) {
        return result.value;
      } else {
        throw new Error(result.error.message);
      }
    },
  });
};
