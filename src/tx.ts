import * as CML from '@dcspark/cardano-multiplatform-lib-browser';

import { TransactionAmount } from './betterfrost';
import { failure, Result, success } from './result';

export type TxProcessError = {
  message: string;
};

export type TransactionInput = {
  transactionId: string;
  outputIndex: bigint;
};

export type ScriptLanguage = 'PlutusV1' | 'PlutusV2' | 'PlutusV3';

export type ScriptRef = {
  language: ScriptLanguage | undefined;
  hash: string;
};

export type TransactionOutput = {
  tx_hash: string;
  index: bigint;
  address: string;
  coin: bigint;
  amount: TransactionAmount[];
  script_ref?: ScriptRef;
  cbor_datum?: string;
};

export type Transaction = {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  referenceInputs: TransactionInput[];
  fee: bigint;
  hash: string;
  ttl: bigint | undefined;
  requiredSigners: string[];
  mint: TransactionAmount[];
  burn: TransactionAmount[];
  cbor: string;
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

const scriptRefFromCML = (script: CML.Script): ScriptRef => {
  return {
    language:
      script.language() !== undefined
        ? ({
            0: 'PlutusV1',
            1: 'PlutusV2',
            2: 'PlutusV3',
          }[script.language() ?? 0] as ScriptLanguage)
        : undefined,
    hash: script.hash().to_hex(),
  };
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

    const ttl = body.ttl();

    const { mint, burn } = (() => {
      const m = body.mint();
      if (m) {
        const positive_mint = convertCMLMultiAsset(m.as_positive_multiasset());
        const burn = convertCMLMultiAsset(m.as_negative_multiasset());
        return { mint: positive_mint, burn };
      } else {
        return { mint: [], burn: [] };
      }
    })();

    const maybeRequiredSigners = body.required_signers();
    const requiredSigners = (
      maybeRequiredSigners
        ? convertCMLList<CML.Ed25519KeyHash>(maybeRequiredSigners)
        : []
    ).map((k) => k.to_hex());

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

    const outputs = convertCMLList<CML.TransactionOutput>(body.outputs()).map(
      (o, i) => {
        return {
          index: BigInt(i),
          address: o.address().to_bech32(),
          coin: o.amount().coin(),
          tx_hash,
          script_ref: o.script_ref()
            ? scriptRefFromCML(o.script_ref()!)
            : undefined,
          amount: [
            ...convertCMLMultiAsset(o.amount().multi_asset()),
            {
              unit: 'lovelace',
              quantity: Number(o.amount().coin()).toString(),
            },
          ],
          cbor_datum: o.datum()?.to_cbor_hex(),
        };
      },
    );

    const transaction: Transaction = {
      inputs: inputs.map((i) => ({
        transactionId: i.transaction_id().to_hex(),
        outputIndex: i.index(),
      })),
      outputs,
      referenceInputs,
      fee: body.fee(),
      hash: tx_hash,
      ttl,
      requiredSigners,
      mint,
      burn,
      cbor: cmlTx.to_cbor_hex(),
    };

    return success(transaction);
  } catch (e) {
    return failure({ message: `Got error processing tx: ${e}` });
  }
};
