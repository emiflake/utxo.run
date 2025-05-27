import { ErrorBox } from '../App';
import { betterfrostURL, Block, useLatestBlock } from '../betterfrost';
import { MiniTransactionCard } from '../components/MiniTx';
import { NavBar } from '../components/nav';
import { ShimmerBox } from '../components/tx';
import { useEffect, useMemo } from 'react';
import { useOgmiosHealth, useQueryLedgerStateUtxos } from '../ogmios';
import { Paginate } from '../components/Pagination';
import { shorten } from '../utils';
import CommandPalette from '../components/CommandPalette';
import { MainLayout } from '../components/layout/Main';
import { Footer } from '../components/layout/Footer';

export const ViewBlock = ({ block }: { block: Block }) => {
  const formattedDate = block?.time
    ? new Date(block.time * 1000).toLocaleString()
    : null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-800/50 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col gap-1">
        {/* Header with hash and size */}
        <div className="flex items-center justify-between">
          {/* Not a link yet */}
          <div className="font-mono text-sm truncate" title={block?.hash}>
            {shorten(block?.hash)}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              #{block?.slot}
            </span>
          </div>
        </div>

        {/* Block info */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex gap-1 items-center">
            <span className="text-gray-500 dark:text-gray-400">
              Height {block?.height}
            </span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">•</span>
            <span className="text-gray-500 dark:text-gray-400">
              {formattedDate}
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {block?.tx_count} txs
          </span>
        </div>
      </div>
    </div>
  );
};

export const ViewLatestBlock = () => {
  const { data: latestBlock, isLoading, isError } = useLatestBlock();

  if (isLoading) {
    return <ShimmerBox />;
  }

  if (isError) {
    return <ErrorBox message={'Could not load latest block'} />;
  }

  if (latestBlock !== undefined) {
    return <ViewBlock block={latestBlock} />;
  }
};

export const ViewUtxos = () => {
  const ledgerStateQuery = useQueryLedgerStateUtxos();

  // Deduplicate utxos with same tx hash
  const uniqueUtxos = useMemo(
    () =>
      ledgerStateQuery.data?.result?.filter(
        (utxo, index) =>
          index ===
          ledgerStateQuery.data?.result?.findIndex(
            (u) => u.transaction.id === utxo.transaction.id,
          ),
      ),
    [ledgerStateQuery.data?.result],
  );

  if (ledgerStateQuery.isLoading) {
    return <ShimmerBox />;
  }

  if (ledgerStateQuery.isError) {
    return <ErrorBox message={'Could not load utxos'} />;
  }

  return (
    <div className="flex flex-col gap-2 border border-gray-200 dark:border-gray-700 p-4 dark:text-white">
      <Paginate
        items={uniqueUtxos || []}
        itemsPerPage={10}
        render={(utxo) => (
          <MiniTransactionCard
            key={`${utxo.transaction.id}`}
            txHash={utxo.transaction.id}
          />
        )}
      />
    </div>
  );
};

export const ChainPage = () => {
  const ogmiosHealthQuery = useOgmiosHealth();

  useEffect(() => {
    document.title = 'utxo.run | chain';
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <CommandPalette />

      <MainLayout ariaLabel="Chain page">
        <h2 className="dark:text-white">Chain explorer</h2>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <span className="font-medium">Note:</span> This page is experimental
            and may not work as expected. Namely, it fetches UTXOs from the
            ledger state through ogmios and may not succeed in cases where
            ogmios struggles to provide a large number of UTXOs.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Running against betterfrost {betterfrostURL}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:flex-1 gap-2">
          <div className="flex flex-col gap-2 lg:w-1/2 border dotted border-gray-200 dark:border-gray-700 p-4 dark:text-white">
            <p className="text-md dark:text-white">Latest block</p>
            <ViewLatestBlock />
          </div>

          <div className="flex flex-col gap-2 lg:w-1/2 border border-gray-200 dark:border-gray-700 p-4 dark:text-white">
            {ogmiosHealthQuery.data && <ViewUtxos />}
            {!ogmiosHealthQuery.data && (
              <div className="flex flex-col gap-2">
                Ogmios is not available! Other pages will still work.
              </div>
            )}
          </div>
        </div>
      </MainLayout>
      <Footer />
    </div>
  );
};
