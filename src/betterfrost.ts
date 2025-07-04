import { useQuery, UseQueryResult } from '@tanstack/react-query';
import * as zod from 'zod';
import * as tx from './tx';

export const betterfrostURL = '/betterfrost';

export const paginationSchema = zod.object({
  count: zod.number().default(10),
  page: zod.number().default(1),
  order: zod.string().default('asc'),
});

export type Pagination = zod.infer<typeof paginationSchema>;

export const urlWithParams = (
  url: string,
  params: Record<string, string | number>,
): URL => {
  const urlWithParams = new URL(url, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    urlWithParams.searchParams.set(key, value.toString());
  });
  return urlWithParams;
};

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

export const assetHistorySchema = zod.object({
  tx_hash: zod.string(),
  amount: zod.string(),
  action: zod.string(),
});

export type AssetHistory = zod.infer<typeof assetHistorySchema>;

export const assetTransactionSchema = zod.object({
  tx_hash: zod.string().nullable(),
  tx_index: zod.number().nullable(),
  block_height: zod.number().nullable(),
  block_time: zod.number().nullable(),
});

export type AssetTransaction = zod.infer<typeof assetTransactionSchema>;

export const cborSchema = zod.object({
  cbor: zod.string(),
});

export type Cbor = zod.infer<typeof cborSchema>;

export const getTxsWithPolicyIds = async (
  policyIds: string[],
): Promise<AssetPolicyTransaction[]> => {
  const response = await fetch(`${betterfrostURL}/api/v0/assets/policy/utxos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(policyIds),
  });
  return assetPolicyTransactionSchema.array().parse(await response.json());
};

export const getCborByDatumHash = async (datumHash: string): Promise<Cbor> => {
  const response = await fetch(
    `${betterfrostURL}/api/v0/scripts/datum/${datumHash}/cbor`,
  );
  return cborSchema.parse(await response.json());
};

export const getTxCborByHash = async (hash: string): Promise<Cbor> => {
  const response = await fetch(`${betterfrostURL}/api/v0/txs/${hash}/cbor`);
  return cborSchema.parse(await response.json());
};

export const getLatestBlock = async (): Promise<Block> => {
  const response = await fetch(`${betterfrostURL}/api/v0/blocks/latest`);
  return blockSchema.parse(await response.json());
};

export const getBlockByHashOrNumber = async (
  hashOrNumber: string,
): Promise<Block> => {
  const response = await fetch(
    `${betterfrostURL}/api/v0/blocks/${hashOrNumber}`,
  );
  return blockSchema.parse(await response.json());
};

export const getTxByHash = async (
  hash: string,
): Promise<Transaction | null> => {
  const response = await fetch(`${betterfrostURL}/api/v0/txs/${hash}`, {
    signal: AbortSignal.timeout(1000),
  });
  const json = await response.json();

  return transactionSchema.parse(json);
};

export const getTxUtxosByHash = async (
  hash: string,
): Promise<TransactionUtxosResponse> => {
  const response = await fetch(`${betterfrostURL}/api/v0/txs/${hash}/utxos`);
  return transactionUtxosResponseSchema.parse(await response.json());
};

export const getUtxosByAddress = async (
  address: string,
): Promise<AddressUtxo[]> => {
  const response = await fetch(
    `${betterfrostURL}/api/v0/addresses/${address}/utxos`,
    {
      method: 'GET',
    },
  );
  const json = await response.json();

  return addressUtxoSchema.array().parse(json);
};

export const getAssetHistory = async (
  unit: string,
  pagination: Partial<Pagination> = {},
): Promise<AssetHistory[]> => {
  const parsedPagination = paginationSchema.parse(pagination);
  const url = urlWithParams(
    `${betterfrostURL}/api/v0/assets/${unit}/history`,
    parsedPagination,
  );
  const response = await fetch(url, {
    method: 'GET',
  });
  const json = await response.json();

  return assetHistorySchema.array().parse(json);
};

export const getAssetTransactions = async (
  unit: string,
  pagination: Partial<Pagination> = {},
): Promise<AssetTransaction[]> => {
  const parsedPagination = paginationSchema.parse(pagination);
  const url = urlWithParams(
    `${betterfrostURL}/api/v0/assets/${unit}/transactions`,
    parsedPagination,
  );
  const response = await fetch(url, {
    method: 'GET',
  });
  const json = await response.json();

  return assetTransactionSchema.array().parse(json);
};

export const useUtxosByAddress = (
  address: string,
): UseQueryResult<AddressUtxo[], unknown> => {
  return useQuery({
    queryKey: ['utxos-by-address', address],
    queryFn: () => getUtxosByAddress(address),
    staleTime: 10_000,
  });
};

export const useTxsWithPolicyIds = (
  policyIds: string[],
): UseQueryResult<AssetPolicyTransaction[], unknown> => {
  return useQuery({
    queryKey: ['txs-with-policy-ids', policyIds],
    queryFn: () => getTxsWithPolicyIds(policyIds),
    staleTime: 10_000,
  });
};

export const useTxUtxosByHash = (
  hash: string,
): UseQueryResult<TransactionUtxosResponse, unknown> => {
  return useQuery({
    queryKey: ['tx-utxos', hash],
    queryFn: () => getTxUtxosByHash(hash),
    staleTime: 10_000,
  });
};

export const useTxByHash = (
  hash: string,
): UseQueryResult<Transaction, unknown> => {
  return useQuery({
    queryKey: ['tx', hash],
    queryFn: () => getTxByHash(hash),
    staleTime: 10_000,
    retry: 2,
  });
};

export const useLatestBlock = (): UseQueryResult<Block, unknown> => {
  return useQuery({
    queryKey: ['latest-block'],
    queryFn: () => getLatestBlock(),
    staleTime: 1000,
    refetchInterval: 5000,
  });
};

export const useBlockByHashOrNumber = (
  hashOrNumber: string,
): UseQueryResult<Block, unknown> => {
  return useQuery({
    queryKey: ['block', hashOrNumber],
    queryFn: () => getBlockByHashOrNumber(hashOrNumber),
    staleTime: 10_000,
  });
};

export const useCborByDatumHash = (
  datumHash: string,
): UseQueryResult<string, unknown> => {
  return useQuery({
    queryKey: ['cbor', datumHash],
    queryFn: () => getCborByDatumHash(datumHash).then((cbor) => cbor.cbor),
    staleTime: 10_000,
  });
};

export const useTxDataByHash = (
  txHash: string,
): UseQueryResult<tx.Transaction, unknown> => {
  return useQuery({
    queryKey: ['tx-data', txHash],
    queryFn: async () => {
      if (txHash.length === 0) {
        return null;
      }
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

export const useAssetHistory = (
  unit: string,
  pagination: Partial<Pagination> = {},
): UseQueryResult<AssetHistory[], unknown> => {
  return useQuery({
    queryKey: ['asset-history', unit, pagination],
    queryFn: () => getAssetHistory(unit, pagination),
    staleTime: 10_000,
  });
};

export const useAssetTransactions = (
  unit: string,
  pagination: Partial<Pagination> = {},
): UseQueryResult<AssetTransaction[], unknown> => {
  return useQuery({
    queryKey: ['asset-transactions', unit, pagination],
    queryFn: () => getAssetTransactions(unit, pagination),
    staleTime: 10_000,
  });
};

export const submitTx = async (bytes: Uint8Array) => {
  const response = await fetch(`${betterfrostURL}/api/v0/tx/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/cbor',
    },
    body: bytes,
  });
  return response.json();
};
