import { ErrorBox } from '../App';
import { betterfrostURL, Block, useLatestBlock } from '../betterfrost';
import { MiniTransactionCard } from '../components/MiniTx';
import { NavBar } from '../components/nav';
import { ShimmerBox } from '../components/tx';
import { useQueryLedgerStateUtxos } from '../ogmios';

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
            {block?.hash.slice(0, 10)}...{block?.hash.slice(-6)}
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
  const { data: utxos, isLoading, isError } = useQueryLedgerStateUtxos();

  if (isLoading) {
    return <ShimmerBox />;
  }

  if (isError) {
    return <ErrorBox message={'Could not load utxos'} />;
  }

  return (
    <div className="flex flex-col gap-2 border dotted border-gray-200 dark:border-gray-700 p-4 dark:text-white">
      <span className="text-xs">UTXOs</span>
      <div className="flex flex-col gap-2">
        {utxos?.result && (
          <span className="text-xs">UTXOs: {utxos.result.length}</span>
        )}
        {utxos?.result && (
          <div className="flex flex-col gap-2">
            {utxos.result.map((utxo) => (
              <MiniTransactionCard
                key={utxo.transaction.id}
                txHash={utxo.transaction.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChainPage = () => {
  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">
          <h2 className="dark:text-white">Chain explorer</h2>

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

            <div className="flex flex-col gap-2 lg:w-1/2">
              <ViewUtxos />
            </div>
          </div>
        </main>
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className="bg-gray-100 dark:bg-gray-800"></footer>
    </div>
  );
};
