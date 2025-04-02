import * as CML from "@dcspark/cardano-multiplatform-lib-browser";

import { TransactionAmount } from "./betterfrost";
import { failure, Result, success } from "./result";

export type TxProcessError = {
  message: string;
};

export type TransactionInput = {
  transactionId: string;
  outputIndex: bigint;
};

export type TransactionOutput = {
  tx_hash: string;
  address: string;
  coin: bigint;
  amount: TransactionAmount[];
  cbor_datum?: string;
};

export type Transaction = {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  referenceInputs: TransactionInput[];
  fee: bigint;
  hash: string;
};

type CMLListLike<T> = {
  len: () => number;
  get: (index: number) => T;
};

const convertCMLList = function <T>(list: CMLListLike<T>): T[] {
  return Array(list.len())
    .fill(0)
    .map((_, i) => list.get(i));
};

const convertCMLMultiAsset = (
  multiAsset: CML.MultiAsset,
): TransactionAmount[] => {
  const policyIds = convertCMLList<CML.ScriptHash>(multiAsset.keys());

  const res: TransactionAmount[] = [];

  for (const policyId of policyIds) {
    const assetNameToCoin = multiAsset.get_assets(policyId);
    if (!assetNameToCoin) {
      continue;
    }

    for (const assetName of convertCMLList<CML.AssetName>(
      assetNameToCoin.keys(),
    )) {
      const quantity = assetNameToCoin.get(assetName);
      if (quantity === undefined) {
        continue;
      }

      res.push({
        unit: policyId.to_hex(),
        quantity: Number(quantity).toString(),
      });
    }
  }

  return res;
};

export const processTxFromCbor = (
  txCbor: string,
): Result<Transaction, TxProcessError> => {
  try {
    const cmlTx = CML.Transaction.from_cbor_hex(txCbor);
    const body = cmlTx.body();

    const tx_hash = CML.hash_transaction(cmlTx.body()).to_hex();

    const inputs = convertCMLList<CML.TransactionInput>(body.inputs());

    const referenceInputs = (() => {
      const ref = body.reference_inputs();
      if (ref) {
        return convertCMLList<CML.TransactionInput>(ref).map((i) => ({
          transactionId: i.transaction_id().to_hex(),
          outputIndex: i.index(),
        }));
      } else {
        return [];
      }
    })();

    const transaction: Transaction = {
      inputs: inputs.map((i) => ({
        transactionId: i.transaction_id().to_hex(),
        outputIndex: i.index(),
      })),
      outputs: convertCMLList<CML.TransactionOutput>(body.outputs()).map(
        (o) => ({
          address: o.address().to_bech32(),
          coin: o.amount().coin(),
          tx_hash,
          amount: [
            ...convertCMLMultiAsset(o.amount().multi_asset()),
            {
              unit: "lovelace",
              quantity: Number(o.amount().coin()).toString(),
            },
          ],
          cbor_datum: o.datum()?.to_cbor_hex(),
        }),
      ),
      referenceInputs,
      fee: body.fee(),
      hash: tx_hash,
    };

    return success(transaction);
  } catch (e) {
    return failure({ message: `Got error processing tx: ${e}` });
  }
};
