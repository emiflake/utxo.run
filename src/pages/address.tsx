import { useMemo } from 'react';
import { NavBar } from '../components/nav';
import { useUtxosByAddress } from '../betterfrost';
import { useParams } from 'react-router';
import { ShimmerBox, ViewTransactionOutput, ViewUnit } from '../components/tx';
import { TransactionOutput } from '../tx';
import { ErrorBox } from '../App';
import {
  ClipboardButton,
  LinkClipboardButton,
} from '../components/ActionButtons';

export const AddressPage = () => {
  const params = useParams();

  const address = useMemo(() => {
    return params.address ?? '';
  }, [params]);

  const addressUrl = useMemo(() => {
    return `${window.location.href}`;
  }, []);

  const { data: utxos, isLoading, isError } = useUtxosByAddress(address);

  const totalValue = useMemo(() => {
    // Map from unit to amount
    if (utxos) {
      const total: Record<string, bigint> = {};
      for (const utxo of utxos) {
        for (const amount of utxo.amount) {
          if (total[amount.unit] === undefined) {
            total[amount.unit] = 0n;
          }
          total[amount.unit] += BigInt(amount.quantity);
        }
      }
      return total;
    } else {
      return {};
    }
  }, [utxos]);

  const processedUtxos: TransactionOutput[] = useMemo(() => {
    if (utxos) {
      return utxos.map((utxo) => ({
        address: utxo.address,
        coin: 0n,
        amount: utxo.amount,
        tx_hash: utxo.tx_hash,
        cbor_datum: utxo.data_hash ?? '',
      }));
    } else {
      return [];
    }
  }, [utxos]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">
          <h2 className="dark:text-white">Address</h2>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-300 font-mono">
              {address}
            </span>
            <ClipboardButton
              text={address}
              className="opacity-70 hover:opacity-100 dark:text-white"
            />
            <LinkClipboardButton
              text={addressUrl}
              className="opacity-70 hover:opacity-100 dark:text-white"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:flex-1 gap-2">
            {isLoading && <ShimmerBox />}
            {isError && <ErrorBox message={'Could not load outputs'} />}
            {utxos && (
              <>
                <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
                  <span className="text-md dark:text-white">Outputs</span>
                  {utxos && (
                    <span className="text-xs dark:text-gray-300">
                      Count: {utxos.length}
                    </span>
                  )}
                  {processedUtxos?.map((utxo) => (
                    <ViewTransactionOutput
                      key={utxo.tx_hash}
                      output={utxo}
                      showTxHash={true}
                    />
                  ))}
                </div>
                <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
                  <span className="text-md dark:text-white">
                    Total asset value
                  </span>
                  {totalValue && (
                    <span className="text-xs dark:text-gray-300">
                      Count: {Object.entries(totalValue).length}
                    </span>
                  )}
                  {totalValue &&
                    Object.entries(totalValue).map(([k, v]) => (
                      <ViewUnit key={k} unit={k} quantity={v.toString()} />
                    ))}
                </div>
              </>
            )}
          </div>
        </main>
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className=""></footer>
    </div>
  );
};
