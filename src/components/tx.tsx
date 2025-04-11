import {
  TransactionAmount,
  useTxByHash,
  useTxUtxosByHash,
} from "../betterfrost";

import { useMemo } from "react";
import { useRegistry } from "../registry";
import { Transaction, TransactionInput, TransactionOutput } from "../tx";
import { Link } from "react-router";
import { ClipboardButton } from "./ActionButtons";

export const ViewTransactionHash = ({ hash }: { hash: string }) => {
  const { data: tx, isLoading } = useTxByHash(hash);

  const extraData = useMemo(() => {
    if (isLoading) {
      return null;
    } else if (tx) {
      return (
        <div className="flex flex-col break-all border-2 border-gray-200 dark:border-gray-700 p-2 bg-green-100 dark:bg-green-900">
          <div className="flex flex-1">
            <span className="dark:text-white">Transaction is on-chain!</span>
            <img
              src="/check-badge.svg"
              alt="check badge"
              className="inline-block w-4 h-4 ml-2 self-center dark:invert"
            />
          </div>
          <ul className="list-disc ml-4 text-xs text-gray-500 dark:text-gray-300">
            <li className="text-xs text-gray-500 dark:text-gray-300">
              <span>Block: </span>
              <span className="font-medium">
                {tx.block_height}
              </span>
            </li>
            <li className="text-xs text-gray-500 dark:text-gray-300">{tx?.size} bytes</li>
            <li className="text-xs text-gray-500 dark:text-gray-300">Slot #{tx?.slot}</li>
          </ul>
        </div>
      );
    }
  }, [tx, isLoading]);

  return (
    <>
      {isLoading && <ShimmerBox />}
      {extraData}
    </>
  );
};

export const ViewTxRef = ({ txref }: { txref: string }) => {
  return (
    <Link
      to={`/submitted-tx/${txref}`}
      className="text-indigo-500 dark:text-indigo-300 font-mono md:hover:underline break-all"
    >
      {txref}
    </Link>
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
      return <span className="dark:text-white"> {showPrefix(unit)} </span>;
    } else if (unit === "lovelace") {
      return <span className="text-sm dark:text-white">Ada</span>;
    } else {
      const liqwidName = registry?.scriptInfos.find(
        (s) => s.scriptHash === unit,
      )?.name;

      if (liqwidName) {
        return (
          <span className="flex gap-2">
            {/* TODO: Use local link */}
            <a
              className="text-indigo-500 dark:text-indigo-300 font-mono md:hover:underline"
              href="#"
            >
              {showPrefix(unit)}
            </a>
            <span
              className="text-sm text-green-800 dark:text-green-400 md:hover:underline"
              title="Click to go to registry"
            >
              ({liqwidName})
            </span>
          </span>
        );
      } else {
        return <span className="font-mono dark:text-white">{showPrefix(unit)}</span>;
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
    <div className="flex flex-row justify-between gap-4 border-3 border-dotted border-gray-400 dark:border-gray-600 p-2 bg-white/50 dark:bg-gray-800/50 break-all">
      <span className="text-sm self-center dark:text-white">{resolvedUnitName}</span>
      <span className="text-md justify-self-end dark:text-white">{adjustedQuantity}</span>
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
    <Link
      to={`/address/${address}`}
      className="text-indigo-500 dark:text-indigo-300 font-mono md:hover:underline text-md break-all"
    >
      {address}
    </Link>
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
      return <div className="text-red-900 dark:text-red-400">Error loading input data</div>;
    } else if (inputUtxo) {
      return (
        <>
          {inputUtxo?.address && (
            <div className="flex flex-1 gap-2">
              <span className="text-xs self-center dark:text-white">Address:</span>
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
    <div className="inline-flex flex-col p-2 border-2 gap-2 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      <div className="flex flex-1 gap-4">
        <h2 className="self-center dark:text-white">Input</h2>
        <ViewTxRef txref={`${input.transactionId}#${input.outputIndex}`} />
      </div>
      {extraData}
    </div>
  );
};

// A box that pulses to indicate loading
export const ShimmerBox = () => {
  return <div className="flex flex-col p-2 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>;
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
      <button className="flex flex-col gap-2 border-black dark:border-gray-400 bg-slate-100 dark:bg-slate-700 dark:text-white border-2 p-2 rounded-md break-all max-w-auto text-xs">
        {children}
      </button>
    </a>
  );
};

function ExternalLinkButton({ href, className = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200' }: { href: string, className?: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 p-1 text-xs focus:outline-none transition-colors duration-200 ${className}`}
      title="View in CBOR decoder"
    >
      <div className="relative w-3.5 h-3.5 flex items-center justify-center">
        <div className="absolute inset-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className="h-3.5 w-3.5"
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </div>
      </div>
    </a>
  );
}

export const ViewDatum = ({ datum }: { datum: string }) => {
  const cborNemo = useMemo(() => {
    return `https://cbor.nemo157.com/#type=hex&value=${datum}`;
  }, [datum]);

  return (
    <div className="flex p-1 flex-col gap-2">
      <span className="text-sm dark:text-white">Datum:</span>
      <div className="border-black border-2 bg-gray-900 text-white overflow-hidden">
        <div className="flex items-start">
          <div className="flex-grow p-2">
            <span className="text-xs font-mono break-all dark:text-white">{datum}</span>
          </div>
          <div className="p-1 flex-shrink-0 flex gap-1">
            <ExternalLinkButton href={cborNemo} className="text-white hover:text-blue-300" />
            <ClipboardButton text={datum} className="text-white hover:text-blue-300"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ViewTransactionOutput = ({
  output,
  showTxHash = false,
}: {
  output: TransactionOutput;
  showTxHash?: boolean;
}) => {
  return (
    <div className="inline-flex flex-col p-2 border-2 border-gray-400 dark:border-gray-600 gap-2 bg-gray-50 dark:bg-gray-800 break-all">
      <h2 className="dark:text-white">Output</h2>
      <ViewAddress address={output.address} />
      {showTxHash && <ViewTxRef txref={output.tx_hash} />}
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

export const TxViewer = ({ tx }: { tx: Transaction }) => {
  const inputs = tx.inputs.map((input) => (
    <ViewTransactionInput key={input.transactionId} input={input} />
  ));
  const outputs = tx.outputs.map((output) => (
    <ViewTransactionOutput key={output.address} output={output} />
  ));
  const referenceInputs = tx.referenceInputs.map((input) => (
    <ViewTransactionInput key={input.transactionId} input={input} />
  ));

  return (
    <div className="flex flex-col p-4 border-2 border-gray-200 dark:border-gray-700 gap-2 dark:bg-gray-900">
      <ViewTransactionHash hash={tx.hash} />
      <div className="flex flex-initial gap-4 border-2 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-white p-2">
        Fee: {tx.fee} lovelace
      </div>
      {tx.ttl && <div className="flex flex-initial gap-4 border-2 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-white p-2">
        TTL: {tx.ttl}
      </div>}
      {tx.requiredSigners.length > 0 && <div className="flex flex-initial gap-4 border-2 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-white p-2">
        Required Signers:
        {tx.requiredSigners.map((s) => (
          <span key={s} className="text-indigo-500 dark:text-indigo-300 md:hover:underline">
            {s}
          </span>
        ))}
      </div>}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex flex-col lg:w-1/2 gap-2">
          <h1 className="text-xl text-slate-900 dark:text-white">Inputs</h1>
          {inputs}
          {referenceInputs.length > 0 && (
            <div className="flex flex-col gap-2 bg-amber-50 dark:bg-amber-900/30 p-2">
              <h1 className="text-xl text-slate-900 dark:text-white">Reference Inputs</h1>
              {referenceInputs}
            </div>
          )}
        </div>
        <div className="flex flex-col lg:w-1/2 gap-2">
          <h1 className="text-xl text-slate-900 dark:text-white">Outputs</h1>
          {outputs}
        </div>
      </div>
      {tx.mint.length > 0 && <div className="flex flex-col gap-2 bg-rose-100 dark:bg-red-700/40 p-2">
        <h1 className="text-xl text-slate-900 dark:text-white">Mint</h1>
        <ViewValue value={tx.mint} />
      </div>}
      {tx.burn.length > 0 && <div className="flex flex-col gap-2 bg-rose-50 dark:bg-orange-700/30 p-2">
        <h1 className="text-xl text-slate-900 dark:text-white">Burn</h1>
        <ViewValue value={tx.burn} />
      </div>}
    </div>
  );
};
