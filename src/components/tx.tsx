import * as CML from "@dcspark/cardano-multiplatform-lib-browser";
import { Tx } from "../types";

import {
  TransactionAmount,
  useTxByHash,
  useTxUtxosByHash,
} from "../betterfrost";

import { useMemo } from "react";
import * as cexplorer from "../utils/cexplorer";
import { useRegistry } from "../registry";
import { TransactionInput, TransactionOutput } from "../tx";

export const ViewTransactionHash = ({ hash }: { hash: string }) => {
  const { data: tx, isLoading, isError } = useTxByHash(hash);

  const extraData = useMemo(() => {
    if (isLoading) {
      return null;
    } else if (tx) {
      return (
        <div className="flex flex-col break-all border-2 border-gray-200 p-2 bg-green-100">
          <div className="flex flex-1">
            <span>Transaction is on-chain!</span>
            <img
              src="check-badge.svg"
              alt="check badge"
              className="inline-block w-4 h-4 ml-2 self-center"
            />
          </div>
          <ul className="list-disc ml-4 text-xs text-gray-500">
            <li className="text-xs text-gray-500">
              <span>Block: </span>
              <a
                href={cexplorer.block(tx.block)}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500 md:hover:underline"
              >
                {tx.block_height}
              </a>
            </li>
            <li className="text-xs text-gray-500">{tx?.size} bytes</li>
            <li className="text-xs text-gray-500">Slot #{tx?.slot}</li>
          </ul>
        </div>
      );
    }
  }, [tx, isLoading]);

  const maybeLink = useMemo(() => {
    if (tx) {
      return (
        <a
          href={cexplorer.txHash(hash)}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-500 md:hover:underline"
        >
          <span className="break-all">{hash}</span>
        </a>
      );
    } else if (isLoading) {
      return <span className="break-all">{hash}</span>;
    } else if (isError) {
      return (
        <>
          <span className="break-all">{hash}</span>
          <span className="text-xs text-gray-500">
            (Maybe not on-chain yet)
          </span>
        </>
      );
    }
  }, [tx, isLoading, hash, isError]);

  return (
    <div className="inline-flex flex-col p-2 border-2 border-gray-400 bg-gray-50">
      <h2>Transaction Hash</h2>
      {maybeLink}
      {isLoading && <ShimmerBox />}
      {extraData}
    </div>
  );
};

export const ViewTxRef = ({ txref }: { txref: string }) => {
  return (
    <span className="self-center justify-self-end break-all text-xs text-gray-500">
      {txref}
    </span>
  );
};

const showPrefix = (
  unit: string,
  { threshold = 32 }: { threshold?: number } = {},
) => {
  if (unit.length > threshold) {
    return `${unit.slice(0, threshold)}...`;
  } else {
    return unit;
  }
};

export const ViewUnit = ({
  unit,
  quantity,
}: {
  unit: string;
  quantity: string;
}) => {
  const { data: registry, isLoading, isError } = useRegistry();
  const resolvedUnitName = useMemo(() => {
    if (isLoading || isError) {
      return <> {showPrefix(unit)} </>;
    } else if (unit === "lovelace") {
      return <span className="text-sm">Ada</span>;
    } else {
      const liqwidName = registry?.scriptInfos.find(
        (s) => s.scriptHash === unit,
      )?.name;

      if (liqwidName) {
        return (
          <span className="flex gap-2">
            <a
              className="text-indigo-500 md:hover:underline"
              href={cexplorer.script(unit)}
            >
              {showPrefix(unit)}
            </a>
            <span
              className="text-sm text-green-800 md:hover:underline"
              title="Click to go to registry"
            >
              ({liqwidName})
            </span>
          </span>
        );
      } else {
        return <span>{showPrefix(unit)}</span>;
      }
    }
  }, [registry, unit, isLoading, isError]);
  const decimals = useMemo(() => {
    if (unit === "lovelace") {
      return 6;
    } else {
      return 0;
    }
  }, [unit]);

  const adjustedQuantity = useMemo(() => {
    return Number(parseInt(quantity, 10) / 10 ** decimals).toFixed(decimals);
  }, [quantity, decimals]);

  return (
    <div className="grid grid-cols-4 gap-1 border-3 border-dotted border-gray-400 p-2 break-all">
      <span className="col-span-3 text-sm">{resolvedUnitName}</span>
      <span className="text-md justify-self-end">{adjustedQuantity}</span>
    </div>
  );
};

export const ViewValue = ({ value }: { value: TransactionAmount[] }) => {
  return value.map((v) => {
    return <ViewUnit key={v.unit} unit={v.unit} quantity={v.quantity} />;
  });
};

export const ViewAddress = ({ address }: { address: string }) => {
  return (
    <a
      href={cexplorer.address(address ?? "")}
      target="_blank"
      rel="noreferrer"
      className="self-center text-indigo-500 md:hover:underline text-xs break-all"
    >
      {address}
    </a>
  );
};

export const SeparatorLine = () => {
  return (
    <hr className="w-1/2 h-0.25 mx-auto my-1 bg-gray-200 border-0 rounded-sm dark:bg-gray-700" />
  );
};

export const ViewTransactionInput = ({
  input,
}: {
  input: TransactionInput;
}) => {
  const {
    data: txUtxos,
    isLoading,
    isError,
  } = useTxUtxosByHash(input.transactionId);

  const inputUtxo = useMemo(() => {
    if (isLoading) {
      return null;
    } else if (txUtxos) {
      return txUtxos.outputs[Number(input.outputIndex)];
    }
  }, [txUtxos, input.outputIndex, isLoading]);

  const extraData = useMemo(() => {
    if (isLoading) {
      return <ShimmerBox />;
    } else if (isError) {
      return <div className="text-red-900">Error loading input data</div>;
    } else if (inputUtxo) {
      return (
        <>
          {inputUtxo?.address && (
            <div className="flex flex-1 gap-2">
              <span className="text-sm">Address:</span>
              <ViewAddress address={inputUtxo?.address} />
            </div>
          )}
          {inputUtxo.amount !== undefined && inputUtxo.amount !== null && (
            <>
              <SeparatorLine />
              <ViewValue value={inputUtxo.amount} />
            </>
          )}
          {inputUtxo.inline_datum && (
            <>
              <SeparatorLine />
              <ViewDatum datum={inputUtxo.inline_datum} />
            </>
          )}
        </>
      );
    }
  }, [inputUtxo, isError, isLoading]);

  return (
    <div className="inline-flex flex-col p-2 border-2 gap-2 border-gray-400 bg-gray-50">
      <div className="flex flex-1 gap-4">
        <h2>Input</h2>
        <ViewTxRef txref={`${input.transactionId}#${input.outputIndex}`} />
      </div>
      {extraData}
    </div>
  );
};

// A box that pulses to indicate loading
export const ShimmerBox = () => {
  return <div className="flex flex-col p-2 bg-gray-200 animate-pulse"></div>;
};

export const MiniButton = ({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <a href={href ?? "#"} onClick={onClick ?? (() => {})}>
      <button className="flex flex-col gap-2 border-black bg-slate-100 border-2 p-2 rounded-md break-all max-w-auto text-xs">
        {children}
      </button>
    </a>
  );
};

export const ViewDatum = ({ datum }: { datum: string }) => {
  const cborNemo = useMemo(() => {
    return `https://cbor.nemo157.com/#type=hex&value=${datum}`;
  }, [datum]);

  return (
    <div className="flex p-1 flex-col gap-2">
      <span className="text-sm">Datum:</span>
      <div className="flex flex-col gap-2 border-black border-2 p-2 bg-slate-900 text-white break-all max-w-auto">
        <span className="text-xs break-all font-mono">{datum}</span>
      </div>
      <div className="flex flex-1 gap-2 place-content-end">
        <MiniButton href={cborNemo} onClick={() => {}}>
          cbor.nemo157.com
        </MiniButton>
        <MiniButton onClick={() => navigator.clipboard.writeText(datum)}>
          copy to clipboard
        </MiniButton>
      </div>
    </div>
  );
};

export const ViewTransactionOutput = ({
  output,
}: {
  output: TransactionOutput;
}) => {
  return (
    <div className="inline-flex flex-col p-2 border-2 border-gray-400 gap-2 bg-gray-50 break-all">
      <h2>Output</h2>
      <a
        href={cexplorer.address(output.address)}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-500 text-xs md:hover:underline"
      >
        {output.address}
      </a>
      <SeparatorLine />
      <ViewValue value={output.amount} />
      {output.cbor_datum && (
        <>
          <SeparatorLine />
          <ViewDatum datum={output.cbor_datum} />
        </>
      )}
    </div>
  );
};

export const TxViewer = ({ tx }: { tx: Tx }) => {
  const inputs = tx.transaction.inputs.map((input) => (
    <ViewTransactionInput key={input.transactionId} input={input} />
  ));
  const outputs = tx.transaction.outputs.map((output) => (
    <ViewTransactionOutput key={output.address} output={output} />
  ));
  const referenceInputs = tx.transaction.referenceInputs.map((input) => (
    <ViewTransactionInput key={input.transactionId} input={input} />
  ));

  return (
    <div className="flex flex-col p-4 border-2 border-gray-200 gap-2">
      <h1>Transaction View</h1>
      <ViewTransactionHash
        hash={CML.hash_transaction(tx.cmlTx.body()).to_hex()}
      />
      <div className="flex flex-initial gap-4 border-2 border-gray-400 bg-gray-50 p-2">
        Fee: {tx.transaction.fee} lovelace
      </div>
      <div className="flex flex-initial gap-2">
        <div className="flex flex-col w-1/2 gap-2">
          <h1 className="text-xl text-slate-900">Inputs</h1>
          {inputs}
          <div className="flex flex-col gap-2 bg-amber-50 p-2">
            <h1 className="text-xl text-slate-900">Reference Inputs</h1>
            {referenceInputs}
          </div>
        </div>
        <div className="flex flex-col w-1/2 gap-2">
          <h1 className="text-xl text-slate-900">Outputs</h1>
          {outputs}
        </div>
      </div>
    </div>
  );
};
