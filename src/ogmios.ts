import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';

export const ogmiosURL = '/ogmios';

export const ogmiosResponseSchema = <T>(resultSchema: z.Schema<T>) =>
  z.object({
    jsonrpc: z.string(),
    method: z.string(),
    result: resultSchema,
  });

export const queryLedgerStateUtxosResponseSchema = ogmiosResponseSchema(
  z.array(
    z.object({
      transaction: z.object({
        id: z.string(),
      }),
      index: z.number(),
    }),
  ),
);

export type QueryLedgerStateUtxosResponse = z.infer<
  typeof queryLedgerStateUtxosResponseSchema
>;

export async function queryLedgerStateUtxos(): Promise<QueryLedgerStateUtxosResponse> {
  const response = await fetch(`${ogmiosURL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'queryLedgerState/utxo',
    }),
  });

  const json = await response.json();

  return queryLedgerStateUtxosResponseSchema.parse(json);
}

export const useQueryLedgerStateUtxos = (): {
  data: QueryLedgerStateUtxosResponse | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  return useQuery({
    queryKey: ['query-ledger-state-utxos'],
    queryFn: () => queryLedgerStateUtxos(),
    staleTime: 10_000,
  });
};
