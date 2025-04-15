// export const ViewUtxos = () => {
//   const { data: utxos, isLoading, isError } = useQueryLedgerStateUtxos();

import { useState } from "react";

//   // Deduplicate utxos with same tx hash
//   const uniqueUtxos = useMemo(() => utxos?.result?.filter(
//     (utxo, index) =>
//       index ===
//       utxos?.result?.findIndex(
//         (u) => u.transaction.id === utxo.transaction.id,
//       ),
//   ), [utxos?.result]);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10; // Number of UTXOs to show per page

//   // Calculate pagination values
//   const totalItems = uniqueUtxos?.length || 0;
//   const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
//   // Ensure current page is valid
//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [currentPage, totalPages]);

//   // Get current page items
//   const getCurrentItems = () => {
//     if (!uniqueUtxos) return [];
    
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
//     return uniqueUtxos.slice(startIndex, endIndex);
//   };

//   // Pagination controls
//   const goToNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const goToPreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   if (isLoading) {
//     return <ShimmerBox />;
//   }

//   if (isError) {
//     return <ErrorBox message={'Could not load utxos'} />;
//   }

//   const currentItems = getCurrentItems();

//   return (
//     <div className="flex flex-col gap-2 border border-gray-200 dark:border-gray-700 p-4 dark:text-white">
//       <div className="flex justify-between items-center mb-2">
//         <span className="text-sm font-medium">UTXOs</span>
//         {uniqueUtxos && (
//           <span className="text-xs text-gray-500 dark:text-gray-400">
//             Total: {uniqueUtxos.length}
//           </span>
//         )}
//       </div>
      
//       {/* Key the parent div with currentPage to force re-render on page change */}
//       {currentItems.length > 0 ? (
//         <div className="flex flex-col gap-3" key={`utxo-list-page-${currentPage}`}>
//           {currentItems.map((utxo) => (
//             <MiniTransactionCard
//               key={`${currentPage}-${utxo.transaction.id}`}
//               txHash={utxo.transaction.id}
//             />
//           ))}
//         </div>
//       ) : (
//         <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
//           No UTXOs found
//         </div>
//       )}
      
//       {/* Pagination controls */}
//       {totalItems > 0 && (
//         <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
//           <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
//             Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems}
//           </div>
          
//           <div className="flex gap-2">
//             <IconButton
//               onClick={goToPreviousPage}
//               disabled={currentPage === 1}
//               ariaLabel="Previous page"
//             >
//               <ArrowPrev />
//             </IconButton>
            
//             <span className="flex items-center justify-center h-8 px-3 rounded border border-gray-200 dark:border-gray-700 text-xs">
//               {currentPage} / {totalPages}
//             </span>
            
//             <button
//               onClick={goToNextPage}
//               disabled={currentPage === totalPages}
//               className="flex items-center justify-center h-8 w-8 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//               aria-label="Next page"
//             >
//               <ArrowNext />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

const ArrowNext = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
};

const ArrowPrev = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
};  

export type PaginateProps<T> = {
  items: T[];
  itemsPerPage: number;
  render: (item: T) => React.ReactNode;
};

export function Paginate<T>({ items, itemsPerPage, render }: PaginateProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return items.slice(startIndex, endIndex);
  };
  
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
  
  const currentItems = getCurrentItems();
  
  return (
    <div className="flex flex-col gap-2">
      {/* Items list */}
      <div className="flex flex-col gap-3" key={`page-${currentPage}`}>
        {currentItems.map((item, index) => (
          <div key={`item-${currentPage}-${index}`}>
            {render(item)}
          </div>
        ))}
      </div>
      
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
              <ArrowPrev />
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
              <ArrowNext />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};