import {
  submitTx,
  TransactionAmount,
  useTxByHash,
  useTxUtxosByHash,
} from '@/betterfrost';
import { RefTag } from './MiniTag';

import { useCallback, useContext, useEffect, useId, useMemo } from 'react';
import {
  addressInfo,
  LegacyRedeemer,
  Transaction,
  TransactionInput,
  TransactionOutput,
} from '@/tx';
import { Link } from 'react-router';
import { scriptInfoByAddress, useRegistry } from '@/registry';
import { shorten } from '@/utils';
import { MonoTag, Tag } from './MiniTag';
import { ViewDatum, ViewDatumDiff, ViewMetadatum } from './Datum';
import { Box, BoxHeader } from './layout/Box';
import { ThreeDots } from './layout/ThreeDots';
import * as CML from '@dcspark/cardano-multiplatform-lib-browser';
import * as Betterfrost from '@/betterfrost';
import { ErrorBox } from '@/App';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { DatumContext } from '@/context/DatumContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from './ui/button';

const bytesFromCbor = (cbor: string) => {
  const bs = [];
  for (let i = 0; i < cbor.length; i += 2) {
    bs.push(parseInt(cbor.slice(i, i + 2), 16));
  }
  return Uint8Array.from(bs);
};

export const ViewTransactionLiveness = ({
  hash,
  cbor,
}: { hash: string; cbor?: string }) => {
  const { data: tx, isLoading, isError } = useTxByHash(hash);

  const submit = useCallback(async () => {
    if (!cbor) return;
    const bytes = bytesFromCbor(cbor);
    const response = await submitTx(bytes);
    // TODO: Make it a toast.
    console.log(response);
  }, [cbor]);

  return (
    <>
      {isLoading && (
        <div className="flex flex-col break-all border-1 border-gray-300 dark:border-gray-700 p-2 h-full">
          <span className="dark:text-white">
            Transaction not found on-chain
          </span>
          <span className="dark:text-gray-300 flex items-center gap-1 text-gray-500 text-xs">
            <LoadingSpinner />
            Still checking...
          </span>
        </div>
      )}
      {!isLoading && tx && (
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
            <li className="text-xs text-gray-800 dark:text-gray-300">
              <span>Block: </span>
              <span className="font-medium">{tx.block_height}</span>
              {' ('}
              minted at{' '}
              <span className="text-xs text-gray-700 dark:text-gray-400">
                {tx.block_time}
              </span>
              {', or '}
              <span className="text-xs text-green-700 dark:text-green-400">
                {new Date(tx.block_time * 1000).toLocaleString()}
              </span>
              {')'}
            </li>
            <li className="text-xs text-gray-800 dark:text-gray-300">
              {tx?.size} bytes
            </li>
            <li className="text-xs text-gray-800 dark:text-gray-300">
              Slot #{tx?.slot}
            </li>
          </ul>
        </div>
      )}
      {isError && (
        <div className="flex flex-col break-all border-1 border-gray-300 dark:border-gray-700 p-2 h-full">
          <span className="dark:text-white">
            Transaction not found on-chain
          </span>
          <div className="flex flex-row gap-2">
            You can try to submit the transaction to the network.
          </div>
          <Button onClick={submit} variant="outline">
            Submit
          </Button>
        </div>
      )}
    </>
  );
};

export const ViewUnit = ({
  unit,
  quantity,
}: {
  unit: string;
  quantity: string;
}) => {
  const labelId = useId();

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
    <div
      role="listitem"
      aria-label="UTxO unit"
      className="flex flex-row justify-between gap-4 border-1 shadow-xs bg-gray-50/20 dark:bg-gray-900/20 border-gray-200 dark:border-gray-600 p-2 break-all"
    >
      <span className="text-sm self-center" id={labelId} aria-hidden>
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
      <span
        aria-labelledby={labelId}
        className="text-md justify-self-end dark:text-white"
      >
        {adjustedQuantity}
      </span>
    </div>
  );
};

export const ViewValue = ({ value }: { value: TransactionAmount[] }) => {
  return (
    <div className="flex flex-col gap-2" role="list" aria-label="UTxO value">
      <span className="text-sm dark:text-gray-400 text-gray-600" aria-hidden>
        Value
      </span>
      {value.map((v) => {
        return <ViewUnit key={v.unit} unit={v.unit} quantity={v.quantity} />;
      })}
    </div>
  );
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

export const InputExtraInfo = ({
  utxo,
  input,
}: {
  utxo: Betterfrost.TransactionOutput;
  input: TransactionInput;
}) => {
  const addressInfo = useMemo(() => {
    if (!utxo.address) {
      return;
    }
    const cmlAddress = CML.Address.from_bech32(utxo.address);
    return {
      paymentCredential: cmlAddress.payment_cred()?.to_cbor_hex(),
      stakingCredential: cmlAddress.staking_cred()?.to_cbor_hex(),
    };
  }, [utxo.address]);

  return (
    <div className="flex flex-col min-w-0 p-2 space-y-2 text-xs break-all">
      {/* Header */}
      <div className="pb-1 mb-1 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          UTXO Info
        </h3>
      </div>

      {input.transactionId && (
        <div className="flex items-center">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-24">
            Transaction ID
          </span>
          <Link
            to={`/submitted-tx/${input.transactionId}`}
            className="hover:opacity-80 transition-opacity"
            title="Click to view transaction"
          >
            <RefTag text={input.transactionId} />
          </Link>
        </div>
      )}

      {/* Output Index */}
      {utxo.output_index !== null && (
        <div className="flex items-center">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-24">
            Output Index
          </span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            {utxo.output_index}
          </span>
        </div>
      )}

      {/* Script Reference */}
      {utxo.reference_script_hash && (
        <>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Script Reference
            </span>
            <span className="font-mono text-[10px] text-zinc-700 dark:text-zinc-300 break-all select-all mt-0.5">
              {utxo.reference_script_hash}
            </span>
          </div>
        </>
      )}

      {/* Payment Credential */}
      {addressInfo?.paymentCredential && (
        <>
          <div className="flex items-center">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-24">
              Payment Credential
            </span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {addressInfo.paymentCredential}
            </span>
          </div>
        </>
      )}

      {/* Staking Credential */}
      {addressInfo?.stakingCredential && (
        <>
          <div className="flex items-center">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-24">
              Staking Credential
            </span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {addressInfo.stakingCredential}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export const ViewTransactionInput = ({
  input,
  redeemer,
}: {
  input: TransactionInput;
  redeemer?: LegacyRedeemer;
}) => {
  const {
    data: txUtxos,
    isLoading,
    isError,
  } = useTxUtxosByHash(input.transactionId);

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
    <Box>
      <BoxHeader title={`Input`}>
        {inputUtxo && (
          <Popover>
            <PopoverTrigger>
              <ThreeDots />
            </PopoverTrigger>
            <PopoverContent
              className="w-168"
              style={{
                maxHeight:
                  'calc(var(--radix-popover-content-available-height))',
                overflow: 'auto',
              }}
              side="left"
              align="start"
            >
              <InputExtraInfo utxo={inputUtxo} input={input} />
            </PopoverContent>
          </Popover>
        )}

        <Link
          to={`/submitted-tx/${input.transactionId}`}
          className="hover:opacity-80 transition-opacity"
          title="Click to view transaction"
        >
          <RefTag text="Created" />
        </Link>
      </BoxHeader>

      {isError && <ErrorBox message="Failed to load input" />}

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
          <ViewValue value={inputUtxo.amount} />
        </>
      )}
      {inputUtxo?.inline_datum && (
        <>
          <span className="text-sm dark:text-gray-400 text-gray-600">
            Datum
          </span>

          <ViewDatum datum={inputUtxo.inline_datum} />
        </>
      )}
      {redeemer && (
        <>
          <span className="text-sm dark:text-gray-400 text-gray-600">
            Redeemer
          </span>
          <ViewDatum datum={redeemer.data} />
        </>
      )}
    </Box>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="inline-block animate-spin duration-200 rounded-full h-3 w-3 border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300"></div>
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

export const OutputExtraInfo = ({ utxo }: { utxo: TransactionOutput }) => {
  const addrInfo = useMemo(() => {
    if (!utxo.address) {
      return;
    }
    return addressInfo(utxo.address);
  }, [utxo.address]);

  return (
    <div className="flex flex-col min-w-0 w-full p-2 space-y-2 text-xs break-all">
      {/* Header */}
      <div className="pb-1 mb-1 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          UTXO Info
        </h3>
      </div>

      {utxo.tx_hash && (
        <div className="flex items-center">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-24">
            Transaction ID
          </span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            <Link
              to={`/submitted-tx/${utxo.tx_hash}`}
              className="hover:opacity-80 transition-opacity"
              title="Click to view transaction"
            >
              <RefTag text={utxo.tx_hash} />
            </Link>
          </span>
        </div>
      )}

      {/* Output Index */}
      {utxo.index !== null && (
        <div className="flex items-center">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-24">
            Output Index
          </span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            {utxo.index}
          </span>
        </div>
      )}

      {/* Script Reference */}
      {utxo.script_ref && (
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Script Reference
          </span>
          <span className="font-mono text-[10px] text-zinc-700 dark:text-zinc-300 break-all select-all mt-0.5">
            {utxo.script_ref.hash}
          </span>
        </div>
      )}

      {/* Payment Credential */}
      {addrInfo?.paymentCredential && (
        <div className="flex items-center">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-24">
            Payment Credential
          </span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            {addrInfo.paymentCredential}
          </span>
        </div>
      )}

      {/* Staking Credential */}
      {addrInfo?.stakingCredential && (
        <div className="flex items-center">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-24">
            Staking Credential
          </span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            {addrInfo.stakingCredential}
          </span>
        </div>
      )}
    </div>
  );
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
}: {
  output: TransactionOutput;
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
    <Box>
      <BoxHeader title="Output">
        <Popover>
          <PopoverTrigger>
            <ThreeDots />
          </PopoverTrigger>
          <PopoverContent
            className="w-168 max-h-[calc(var(--radix-popover-content-available-height))] overflow-auto"
            side="left"
            align="start"
          >
            <OutputExtraInfo utxo={output} />
          </PopoverContent>
        </Popover>
        {consumedByTx && (
          <Link
            to={`/submitted-tx/${consumedByTx}`}
            className="hover:opacity-80 transition-opacity"
            title="Click to view transaction that spent this output"
          >
            <RefTag text="Spent" />
          </Link>
        )}
      </BoxHeader>
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
      <ViewValue value={output.amount} />
      {output.cbor_datum && (
        <>
          <span className="text-sm dark:text-gray-400 text-gray-600">
            Datum
          </span>
          <ViewDatum datum={output.cbor_datum} />
        </>
      )}
    </Box>
  );
};

const ViewWithdrawal = ({
  address,
  amount,
  redeemer,
}: {
  address: string;
  amount: bigint;
  redeemer: LegacyRedeemer | undefined;
}) => {
  return (
    <div
      className="inline-flex flex-col p-2 border-1 border-gray-400 dark:border-gray-600 gap-2 bg-gray-50 dark:bg-gray-800 break-all"
      key={address}
    >
      <span className="text-xs text-gray-500 dark:text-gray-300">
        <Link
          className="hover:underline text-indigo-500 dark:text-indigo-300"
          to={`/address/${address}`}
        >
          {address}
        </Link>{' '}
        is withdrawing {amount} lovelace
      </span>
      {redeemer?.data && typeof redeemer?.data === 'string' && (
        <>
          <span className="text-sm dark:text-gray-400 text-gray-600">
            Redeemer
          </span>
          <ViewDatum datum={redeemer.data} />
        </>
      )}
    </div>
  );
};

export const ViewMetadata = ({
  metadata,
}: {
  metadata: Record<string, string>;
}) => {
  return (
    <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-700 p-2">
      <span className="text-md text-slate-900 dark:text-white">
        Metadata{' '}
        <span className="text-xs text-gray-500 dark:text-gray-300">
          ({Object.keys(metadata).length})
        </span>
      </span>
      <div className="flex flex-col gap-2">
        {Object.entries(metadata).map(([key, value]) => (
          <>
            <ViewMetadatum key={key} label={key} metadatum={value} />
          </>
        ))}
      </div>
    </div>
  );
};

export const TxViewer = ({ tx }: { tx: Transaction }) => {
  useEffect(() => {
    // This makes the transaction available in the console for debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).tx = tx;
  }, [tx]);

  const inputs = tx.inputs.map((input, index) => {
    const redeemer = tx.legacyRedeemers.find(
      (r) => r.index === index && r.tag === 'Spend',
    );
    return (
      <ViewTransactionInput
        key={inputKey(input)}
        input={input}
        redeemer={redeemer}
      />
    );
  });
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
            <ViewTransactionLiveness hash={tx.hash} cbor={tx.cbor} />
          </div>
          <div className="flex flex-col w-1/2 gap-2 border border-gray-300 dark:border-gray-700 p-2">
            <h2 className="text-md text-slate-900 dark:text-white">
              Transaction stats
            </h2>
            <div className="flex flex-row gap-2">
              <MonoTag label="Fee" value={`${tx.fee}₳`} />
              {tx.ttl && <MonoTag label="TTL" value={`${tx.ttl}`} />}
            </div>
          </div>
        </div>
        {Object.entries(tx.metadata).length > 0 && (
          <ViewMetadata metadata={tx.metadata} />
        )}
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
                  className="bg-indigo-100 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-200 text-xs font-mono px-3 py-1 border border-indigo-300 dark:border-indigo-300/50 break-all"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {Object.keys(tx.withdrawals).length > 0 && (
          <>
            <h2 className="text-md text-slate-900 dark:text-white">
              Withdrawals{' '}
              <span className="text-xs text-gray-500 dark:text-gray-300">
                ({Object.keys(tx.withdrawals).length})
              </span>
            </h2>
            {Object.entries(tx.withdrawals).map(([address, amount], i) => (
              <ViewWithdrawal
                key={address}
                address={address}
                amount={amount}
                redeemer={tx.legacyRedeemers.find(
                  (r) => r.tag === 'Reward' && r.index === i,
                )}
              />
            ))}
          </>
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
            <div className="flex flex-col gap-2 striped p-2">
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
      <DiffDialog />
    </div>
  );
};

const DiffDialog = () => {
  const datumContext = useContext(DatumContext);
  const handleSetIsOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        datumContext?.unselectAllDatums();
      }
    },
    [datumContext],
  );

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const open = (datumContext?.selectedDatums.length ?? 0) > 1;
  const onOpenChange = (open: boolean) => {
    handleSetIsOpen(open);
  };

  const DiffContent = () => {
    if (!datumContext || datumContext.selectedDatums.length !== 2) return null;
    return (
      <ViewDatumDiff
        key={'datum_diff'}
        datumA={datumContext.selectedDatums[0].cbor}
        datumB={datumContext.selectedDatums[1].cbor}
      />
    );
  };

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="sm:max-w-[1024px] w-full bottom-0 left-1/2 -translate-x-1/2 p-4 max-h-[80vh] min-w-[60vw]"
        >
          <SheetHeader>
            <SheetTitle>Selected Datums</SheetTitle>
            <SheetDescription>Compare selected datums</SheetDescription>
          </SheetHeader>
          <ScrollArea className="overflow-y-scroll">
            <DiffContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="fixed bottom-0 left-0 right-0 max-h-[90dvh]">
        <ScrollArea className="overflow-auto p-4">
          <DrawerHeader>
            <DrawerTitle>Selected Datums</DrawerTitle>
          </DrawerHeader>
          <DiffContent />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
