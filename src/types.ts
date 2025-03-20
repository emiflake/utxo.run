import * as CML from "@dcspark/cardano-multiplatform-lib-browser";
import { Transaction } from "./tx";

export type MultiAsset = Record<string, bigint>;

export type Value = {
  ada: bigint;
  assets?: MultiAsset;
};

export type DatumFields = (
  | {
      datumHash: undefined;
      datum: undefined;
    }
  | {
      datumHash: string;
      datum?: string;
    }
) & { isDatumInline: boolean };

export type TxO = {
  address: string;
  value: Value;
} & DatumFields;

export type TxORef = {
  transactionId: string;
  outputIndex: bigint;
};

export type TxI = TxORef & TxO;

export type Tx = {
  transaction: Transaction;
  cmlTx: CML.Transaction;
};

export type Success<T> = { success: true } & T;
export type Failure<E> = { success: false } & E;
export type Result<T = unknown, E = unknown> = Success<T> | Failure<E>;

export const success = function <T>(value: T): Success<T> {
  return { success: true, ...value };
};
export const failure = function <E>(value: E): Failure<E> {
  return { success: false, ...value };
};

