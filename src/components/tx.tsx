import {
  TransactionAmount,
  useTxByHash,
  useTxUtxosByHash,
} from '../betterfrost';
import { SpentTag } from './MiniTag';

import { useMemo } from 'react';
import { Transaction, TransactionInput, TransactionOutput } from '../tx';
import { Link } from 'react-router';
import { scriptInfoByAddress, useRegistry } from '../registry';
import { shorten } from '../utils';
import { MonoTag, Tag } from './MiniTag';
import { ViewDatum } from './Datum';

export const ViewTransactionHash = ({ hash }: { hash: string }) => {
  const { data: tx, isLoading, isError } = useTxByHash(hash);

  const extraData = useMemo(() => {
    if (isLoading) {
      return null;
    } else if (tx) {
      return (
        <div className="flex flex-col break-all border-1 border-gray-200 dark:border-gray-700 p-2 bg-green-100 dark:bg-green-900">
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
              <span className="font-medium">{tx.block_height}</span>
            </li>
            <li className="text-xs text-gray-500 dark:text-gray-300">
              {tx?.size} bytes
            </li>
            <li className="text-xs text-gray-500 dark:text-gray-300">
              Slot #{tx?.slot}
            </li>
          </ul>
        </div>
      );
    }
  }, [tx, isLoading]);

  return (
    <>
      {isLoading && (
        <div className="flex flex-col break-all border-1 border-gray-300 dark:border-gray-700 p-2 h-full">
          <span className="dark:text-white">
            Checking if transaction is on-chain...
          </span>
          <ShimmerBox />
        </div>
      )}
      {extraData}
      {isError && (
        <div className="flex flex-col break-all border-1 border-gray-300 dark:border-gray-700 p-2 h-full">
          <span className="dark:text-white">
            Transaction not found on-chain
          </span>
          <span className="dark:text-gray-300 text-gray-500 text-xs">
            Likely this is because the transaction is not yet submitted.
          </span>
        </div>
      )}
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

export const ViewUnit = ({
  unit,
  quantity,
}: {
  unit: string;
  quantity: string;
}) => {
  const registryQuery = useRegistry();

  const resolvedUnitName = useMemo(() => {
    if (registryQuery.isLoading || registryQuery.isError) {
      return <span> {shorten(unit)} </span>;
    } else if (unit === 'lovelace') {
      return 'Ada';
    } else {
      return shorten(unit);
    }
  }, [unit, registryQuery.isLoading, registryQuery.isError]);

  const decimals = useMemo(() => {
    if (unit === 'lovelace') {
      return 6;
    } else {
      return 0;
    }
  }, [unit]);

  const adjustedQuantity = useMemo(() => {
    return Number(parseInt(quantity, 10) / 10 ** decimals).toFixed(decimals);
  }, [quantity, decimals]);

  const metadataName = useMemo(() => {
    if (registryQuery.isLoading || registryQuery.isError) {
      return;
    } else if (unit === 'lovelace') {
      return;
    } else {
      const scriptInfo = registryQuery.data?.scriptInfos.find(
        (s) => s.scriptHash === unit,
      );

      if (!scriptInfo) {
        return;
      }

      return scriptInfo.name;
    }
  }, [
    unit,
    registryQuery.isLoading,
    registryQuery.isError,
    registryQuery.data?.scriptInfos,
  ]);

  return (
    <div className="flex flex-row justify-between gap-4 border-3 border-dotted border-gray-400 dark:border-gray-600 p-2 bg-white/50 dark:bg-gray-800/50 break-all">
      <span className="text-sm self-center">
        {unit === 'lovelace' ? (
          <span className="font-mono dark:text-white">{resolvedUnitName}</span>
        ) : (
          <div className="flex flex-row gap-1">
            {metadataName && (
              <Link
                to={`/policy/${unit}`}
                className="text-sm text-indigo-500 dark:text-indigo-300 font-medium md:hover:underline"
              >
                {metadataName}
              </Link>
            )}
            {!metadataName && (
              <Link
                to={`/policy/${unit}`}
                className="text-sm text-indigo-500 dark:text-indigo-300 font-mono md:hover:underline"
              >
                {resolvedUnitName}
              </Link>
            )}
          </div>
        )}
      </span>
      <span className="text-md justify-self-end dark:text-white">
        {adjustedQuantity}
      </span>
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
  const { data: txUtxos, isLoading } = useTxUtxosByHash(input.transactionId);

  const registryQuery = useRegistry();

  const inputUtxo = useMemo(() => {
    if (isLoading) {
      return null;
    } else if (txUtxos) {
      return txUtxos.outputs[Number(input.outputIndex)];
    }
  }, [txUtxos, input.outputIndex, isLoading]);

  const addressScriptInfo = useMemo(() => {
    if (registryQuery.data && inputUtxo?.address) {
      return scriptInfoByAddress(registryQuery.data, inputUtxo.address);
    }
    return undefined;
  }, [registryQuery.data, inputUtxo?.address]);

  return (
    <div className="inline-flex flex-col p-2 border-1 border-gray-400 dark:border-gray-600 gap-2 bg-gray-50 dark:bg-gray-800 break-all">
      <h2 className="dark:text-white">Input</h2>
      <div className="flex flex-1 gap-2">
        <MonoTag
          label="Ref"
          href={`/submitted-tx/${input.transactionId}`}
          value={`${input.transactionId}#${input.outputIndex}`}
        />
      </div>
      {inputUtxo?.address && (
        <div className="flex flex-1 gap-2">
          <Tag
            label="Address"
            href={`/address/${inputUtxo.address}`}
            value={inputUtxo.address}
          />
        </div>
      )}
      {addressScriptInfo && (
        <div className="flex flex-1 gap-2">
          <Tag
            label="Validator"
            value={addressScriptInfo.name}
            labelColor="bg-green-100 dark:bg-green-700/50"
          />
        </div>
      )}
      {inputUtxo?.amount !== undefined && inputUtxo?.amount !== null && (
        <>
          <SeparatorLine />
          <ViewValue value={inputUtxo.amount} />
        </>
      )}
      {inputUtxo?.inline_datum && (
        <>
          <SeparatorLine />
          <ViewDatum datum={inputUtxo.inline_datum} />
        </>
      )}
    </div>
  );
};

// A box that pulses to indicate loading
export const ShimmerBox = ({ className = '' }: { className?: string }) => {
  return (
    <div
      className={`flex flex-col p-2 bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
    ></div>
  );
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
    <a href={href ?? '#'} onClick={onClick ?? (() => {})}>
      <button className="flex flex-col gap-2 border-black dark:border-gray-400 bg-slate-100 dark:bg-slate-700 dark:text-white border-2 p-2 rounded-md break-all max-w-auto text-xs">
        {children}
      </button>
    </a>
  );
};

const inputKey = (input: TransactionInput) => {
  return `in-${input.transactionId}#${input.outputIndex}`;
};

const outputKey = (output: TransactionOutput) => {
  return `out-${output.address}#${output.index}`;
};

/**
 * A component that displays a transaction output.
 *
 * For the `key`, you should use the output's address combined with the output's index.
 *
 * @example
 * ```tsx
 * <ViewTransactionOutput
 *   key={outputKey(output)}
 *   output={output}
 * />
 * ```
 */
export const ViewTransactionOutput = ({
  output,
  showTxHash = false,
}: {
  output: TransactionOutput;
  showTxHash?: boolean;
}) => {
  const utxosByHashQuery = useTxUtxosByHash(output.tx_hash);

  const consumedByTx = useMemo(() => {
    if (utxosByHashQuery.data) {
      const utxo = utxosByHashQuery.data.outputs[Number(output.index)];
      return utxo?.consumed_by_tx || undefined;
    }
    return undefined;
  }, [utxosByHashQuery.data, output.index]);

  const registryQuery = useRegistry();

  const addressScriptInfo = useMemo(() => {
    if (registryQuery.data) {
      return scriptInfoByAddress(registryQuery.data, output.address);
    }
    return undefined;
  }, [registryQuery.data, output.address]);

  return (
    <div className="inline-flex flex-col p-2 border-1 border-gray-400 dark:border-gray-600 gap-2 bg-gray-50 dark:bg-gray-800 break-all">
      <div className="flex items-center gap-2">
        <h2 className="dark:text-white">Output</h2>
        {consumedByTx && (
          <Link
            to={`/submitted-tx/${consumedByTx}`}
            className="hover:opacity-80 transition-opacity"
            title="Click to view transaction that spent this output"
          >
            <SpentTag />
          </Link>
        )}
      </div>
      <div className="flex flex-1 gap-2">
        <Tag
          label="Address"
          href={`/address/${output.address}`}
          value={output.address}
        />
      </div>
      {addressScriptInfo && (
        <div className="flex flex-1 gap-2">
          <Tag
            label="Validator"
            value={addressScriptInfo.name}
            labelColor="bg-green-100 dark:bg-green-700/50"
          />
        </div>
      )}
      {output.script_ref && (
        <div className="flex flex-1 gap-2">
          <MonoTag label="Script Ref" value={output.script_ref.hash} />
        </div>
      )}
      {showTxHash && (
        <MonoTag
          label="Ref"
          value={`${output.tx_hash}#${output.index}`}
          href={`/submitted-tx/${output.tx_hash}`}
        />
      )}
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

/**
 * A component that displays a generic label and value inline, similar to MonoTag in ScriptInfo.
 *
 * @param label - The label to display
 * @param value - The value to display
 * @param href - Optional link URL
 * @returns A styled inline label-value pair component
 */
export const GenericInfo = ({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) => {
  return (
    <span className="inline-flex items-stretch text-xs mr-2 mb-1 border border-gray-100 dark:border-gray-700 w-full">
      <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 flex-shrink-0">
        {label}
      </span>
      {href && (
        <Link
          to={href}
          className="bg-gray-50 dark:bg-gray-800 text-indigo-500 dark:text-indigo-300 hover:underline px-1.5 py-0.5 font-mono flex-grow"
        >
          {value}
        </Link>
      )}
      {!href && (
        <span className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 font-mono flex-grow">
          {value}
        </span>
      )}
    </span>
  );
};

export const TxViewer = ({ tx }: { tx: Transaction }) => {
  const inputs = tx.inputs.map((input) => (
    <ViewTransactionInput key={inputKey(input)} input={input} />
  ));
  const outputs = tx.outputs.map((output) => (
    <ViewTransactionOutput key={outputKey(output)} output={output} />
  ));
  const referenceInputs = tx.referenceInputs.map((input) => (
    <ViewTransactionInput key={inputKey(input)} input={input} />
  ));

  return (
    <div className="flex flex-col p-4 border-1 border-gray-200 dark:border-gray-700 gap-2 dark:bg-gray-900">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div className="flex flex-col w-1/2">
            <ViewTransactionHash hash={tx.hash} />
          </div>
          <div className="flex flex-col w-1/2 gap-2 border border-gray-300 dark:border-gray-700 p-2">
            <h2 className="text-md text-slate-900 dark:text-white">
              Transaction stats
            </h2>
            <div className="flex flex-row gap-2">
              <MonoTag label="Fee" value={`${tx.fee} lovelace`} />
              {tx.ttl && <MonoTag label="TTL" value={`${tx.ttl}`} />}
            </div>
          </div>
        </div>
        {tx.requiredSigners.length > 0 && (
          <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
            <span className="text-md text-slate-900 dark:text-white">
              Required Signers{' '}
              <span className="text-xs text-gray-500 dark:text-gray-300">
                ({tx.requiredSigners.length})
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              {tx.requiredSigners.map((s) => (
                <span
                  key={s}
                  className="bg-indigo-100 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-200 text-xs font-mono px-3 py-1 border border-indigo-300 dark:border-indigo-300/50"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {Object.keys(tx.withdrawals).length > 0 && (
          <div className="flex flex-col bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 gap-2 p-2">
            <h2 className="text-md text-slate-900 dark:text-white">
              Withdrawals{' '}
              <span className="text-xs text-gray-500 dark:text-gray-300">
                ({Object.keys(tx.withdrawals).length})
              </span>
            </h2>
            {Object.entries(tx.withdrawals).map(([address, amount]) => (
              <div className="flex-1 flex-col gap-2" key={address}>
                <MonoTag label={address} value={`${amount} lovelace`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex flex-col lg:w-1/2 gap-2">
          <h1 className="text-xl text-slate-900 dark:text-white">
            Inputs{' '}
            <span className="text-xs text-gray-500 dark:text-gray-300">
              ({tx.inputs.length})
            </span>
          </h1>
          {inputs}
          {referenceInputs.length > 0 && (
            <div className="flex flex-col gap-2 bg-amber-50 dark:bg-amber-50/20 p-2">
              <h1 className="text-xl text-slate-900 dark:text-white">
                Reference Inputs{' '}
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  ({referenceInputs.length})
                </span>
              </h1>
              {referenceInputs}
            </div>
          )}
        </div>
        <div className="flex flex-col lg:w-1/2 gap-2">
          <h1 className="text-xl text-slate-900 dark:text-white">
            Outputs{' '}
            <span className="text-xs text-gray-500 dark:text-gray-300">
              ({tx.outputs.length})
            </span>
          </h1>
          {outputs}
        </div>
      </div>
      {tx.mint.length > 0 && (
        <div className="flex flex-col gap-2 bg-blue-100 dark:bg-blue-700/40 p-2">
          <h1 className="text-xl text-slate-900 dark:text-white">
            Mint{' '}
            <span className="text-xs text-gray-500 dark:text-gray-300">
              ({tx.mint.length})
            </span>
          </h1>
          <ViewValue value={tx.mint} />
        </div>
      )}
      {tx.burn.length > 0 && (
        <div className="flex flex-col gap-2 bg-rose-50 dark:bg-red-700/30 p-2">
          <h1 className="text-xl text-slate-900 dark:text-white">
            Burn{' '}
            <span className="text-xs text-gray-500 dark:text-gray-300">
              ({tx.burn.length})
            </span>
          </h1>
          <ViewValue value={tx.burn} />
        </div>
      )}
    </div>
  );
};
