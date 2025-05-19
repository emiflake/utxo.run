import { useRef, useState } from 'react';
import { ArrowNext, ArrowPrev } from './Icons';

export type PaginateProps<T> = {
  items: T[];
  itemsPerPage: number;
  render: (item: T) => React.ReactNode;
};

export function Paginate<T>({ items, itemsPerPage, render }: PaginateProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const controlsRef = useRef<HTMLDivElement>(null);

  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return items.slice(startIndex, endIndex);
  };

  const scrollToControls = () => {
    controlsRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
    scrollToControls();
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
    scrollToControls();
  };

  const currentItems = getCurrentItems();

  return (
    <div className="flex flex-col gap-2">
      {/* Items list */}
      <div className="flex flex-col gap-3" key={`page-${currentPage}`}>
        {currentItems.map((item, index) => (
          <div key={`item-${currentPage}-${index}`}>{render(item)}</div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalItems > 0 && (
        <div
          ref={controlsRef}
          className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}{' '}
            - {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems}
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
}
