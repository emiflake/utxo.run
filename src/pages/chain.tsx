import { ErrorBox } from '../App';
import { betterfrostURL, Block, useLatestBlock } from '../betterfrost';
import { MiniTransactionCard } from '../components/MiniTx';
import { NavBar } from '../components/nav';
import { ShimmerBox } from '../components/tx';
import { useState, useEffect, useMemo } from 'react';
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

  // Deduplicate utxos with same tx hash
  const uniqueUtxos = useMemo(() => utxos?.result?.filter(
    (utxo, index) =>
      index ===
      utxos?.result?.findIndex(
        (u) => u.transaction.id === utxo.transaction.id,
      ),
  ), [utxos?.result]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of UTXOs to show per page

  // Calculate pagination values
  const totalItems = uniqueUtxos?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Get current page items
  const getCurrentItems = () => {
    if (!uniqueUtxos) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return uniqueUtxos.slice(startIndex, endIndex);
  };

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return <ShimmerBox />;
  }

  if (isError) {
    return <ErrorBox message={'Could not load utxos'} />;
  }

  const currentItems = getCurrentItems();

  return (
    <div className="flex flex-col gap-2 border border-gray-200 dark:border-gray-700 p-4 dark:text-white">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">UTXOs</span>
        {uniqueUtxos && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Total: {uniqueUtxos.length}
          </span>
        )}
      </div>
      
      {/* Key the parent div with currentPage to force re-render on page change */}
      {currentItems.length > 0 ? (
        <div className="flex flex-col gap-3" key={`utxo-list-page-${currentPage}`}>
          {currentItems.map((utxo) => (
            <MiniTransactionCard
              key={`${currentPage}-${utxo.transaction.id}`}
              txHash={utxo.transaction.id}
            />
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No UTXOs found
        </div>
      )}
      
      {/* Pagination controls */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-8 w-8 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <span className="flex items-center justify-center h-8 px-3 rounded border border-gray-200 dark:border-gray-700 text-xs">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-8 w-8 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
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

          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <span className="font-medium">Note:</span> This page is experimental and may not work as expected.

              Namely, it fetches UTXOs from the ledger state through ogmios and may not succeed in cases where ogmios struggles to provide a large number of UTXOs.
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
