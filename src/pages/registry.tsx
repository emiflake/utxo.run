import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { NavBar } from '../components/nav';
import { ScriptInfo, useRegistry } from '../registry';
import { ShimmerBox } from '../components/tx';
import { ErrorBox } from '../App';
import { Link } from 'react-router';
import { ScriptTypeTag } from '../components/MiniTag';
import { shorten } from '../utils';
import CommandPalette from '../components/CommandPalette';

// Column helper for TanStack Table
const columnHelper = createColumnHelper<ScriptInfo>();

// Define table columns
const columns = [
  columnHelper.accessor('type', {
    header: 'Type',
    cell: (info) => info.getValue() || 'N/A',
    size: 120,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue() || 'N/A',
    size: 150,
  }),
  columnHelper.accessor('scriptHash', {
    header: 'Script Hash',
    cell: (info) => info.getValue() || 'N/A',
    size: 200,
  }),
  columnHelper.accessor('componentName', {
    header: 'Component Name',
    cell: (info) => info.getValue() || 'N/A',
    size: 150,
  }),
  columnHelper.accessor('market', {
    header: 'Market',
    cell: (info) => info.getValue() || 'N/A',
    size: 120,
  }),
];

export const RegistryPage = () => {
  const registryQuery = useRegistry();

  // Create table instance
  const table = useReactTable({
    data: registryQuery.data?.scriptInfos || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
  });

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <CommandPalette />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">
          <h2 className="dark:text-white">Script Registry</h2>

          {registryQuery.isSuccess &&
            registryQuery.data.scriptInfos.length > 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                {registryQuery.data.scriptInfos.length} scripts found in the
                registry.
              </div>
            )}

          {registryQuery.isLoading && <ShimmerBox />}

          {registryQuery.isError && (
            <ErrorBox message="Failed to load registry data. Please try again later." />
          )}

          {registryQuery.isSuccess && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-x-scroll">
              <div className="max-w-[calc(100vw-12rem)] h-[calc(100vh-12rem)] relative">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            style={{
                              width: `${header.column.getSize()}px`,
                              minWidth: `${header.column.getSize()}px`,
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:shadow-sm"
                      >
                        {row.getVisibleCells().map((cell) => {
                          const columnId = cell.column.id;

                          // Special styling for type column
                          if (columnId === 'type') {
                            const type = cell.getValue() as
                              | 'MintingPolicy'
                              | 'Validator'
                              | 'StakeValidator';
                            return (
                              <td
                                key={cell.id}
                                className="px-6 py-4 overflow-hidden text-ellipsis"
                                style={{
                                  width: `${cell.column.getSize()}px`,
                                  minWidth: `${cell.column.getSize()}px`,
                                }}
                              >
                                <ScriptTypeTag scriptType={type} />
                              </td>
                            );
                          }

                          // Special styling for scriptHash column
                          if (columnId === 'scriptHash') {
                            const hash = cell.getValue() as string;
                            return (
                              <td
                                key={cell.id}
                                className="px-6 py-4 overflow-hidden text-ellipsis"
                                style={{
                                  width: `${cell.column.getSize()}px`,
                                  minWidth: `${cell.column.getSize()}px`,
                                }}
                              >
                                <Link
                                  to={`/policy/${hash}`}
                                  className="text-indigo-500 dark:text-indigo-300 font-mono text-sm hover:underline"
                                  title={hash}
                                >
                                  {shorten(hash)}
                                </Link>
                              </td>
                            );
                          }

                          // Special styling for name column
                          if (columnId === 'name') {
                            return (
                              <td
                                key={cell.id}
                                className="px-6 py-4 overflow-hidden text-ellipsis"
                                style={{
                                  width: `${cell.column.getSize()}px`,
                                  minWidth: `${cell.column.getSize()}px`,
                                }}
                              >
                                <span className="font-medium text-gray-800 dark:text-white">
                                  {cell.getValue() as string}
                                </span>
                              </td>
                            );
                          }

                          // Default styling for other columns
                          return (
                            <td
                              key={cell.id}
                              className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 overflow-hidden text-ellipsis"
                              style={{
                                width: `${cell.column.getSize()}px`,
                                minWidth: `${cell.column.getSize()}px`,
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className=""></footer>
    </div>
  );
};
