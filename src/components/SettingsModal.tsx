import React, { useMemo } from 'react';
import { ogmiosURL, useOgmiosHealth } from '../ogmios';
import { betterfrostURL, useLatestBlock } from '../betterfrost';
import { SettingsIcon } from './Icons';
import { RegistryUrlSetting } from '../registry_context';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    data: latestBlock,
    isLoading: latestBlockLoading,
    isError: latestBlockError,
  } = useLatestBlock();

  const ogmiosHealthQuery = useOgmiosHealth();

  const betterfrostConnectionState = useMemo(() => {
    if (latestBlockLoading) return 'loading';
    if (latestBlockError) return 'error';
    return latestBlock !== undefined ? 'connected' : 'error';
  }, [latestBlock, latestBlockLoading, latestBlockError]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-transparent bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white">Settings</h2>
            <SettingsIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Configure your application settings below:
          </p>
          <div className="min-h-[44px] border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded flex items-center opacity-60 cursor-not-allowed">
            <label
              htmlFor="ogmios-url"
              className="text-sm font-medium dark:text-white pl-3 pr-2 whitespace-nowrap select-none"
            >
              Ogmios URL:
            </label>
            <input
              type="text"
              id="ogmios-url"
              value={ogmiosURL}
              disabled
              className="flex-1 h-10 px-2 py-1 bg-gray-100 dark:bg-gray-900 outline-none font-mono text-base text-gray-400 dark:text-gray-500 border-none"
              title="This is disabled because it is set in the environment"
            />
            <span className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-r font-mono text-base text-gray-700 dark:text-gray-300 select-none">
              <ConnectionState
                connectionState={ogmiosHealthQuery.data ? 'connected' : 'error'}
              />
            </span>
          </div>
          <div className="min-h-[44px] border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded flex items-center opacity-60 cursor-not-allowed">
            <label
              htmlFor="betterfrost-url"
              className="dark:text-white pl-3 pr-2 whitespace-nowrap select-none"
            >
              Betterfrost URL:
            </label>
            <input
              type="text"
              id="betterfrost-url"
              value={betterfrostURL}
              disabled
              className="flex-1 h-10 px-2 py-1 bg-gray-100 dark:bg-gray-900 outline-none font-mono text-base text-gray-400 dark:text-gray-500 border-none"
              title="This is disabled because it is set in the environment"
            />
            <span className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-r font-mono text-base text-gray-700 dark:text-gray-300 select-none">
              <ConnectionState connectionState={betterfrostConnectionState} />
            </span>
          </div>
          {/* Registry URL setting */}
          <RegistryUrlSetting />
          <button
            onClick={onClose}
            className="mt-4 border px-4 py-2 rounded text-sm text-indigo-500 dark:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ConnectionState = ({
  connectionState,
}: { connectionState: 'connected' | 'loading' | 'error' }) => {
  if (connectionState === 'connected') {
    return (
      <span className="text-green-800 dark:text-green-400">Connected</span>
    );
  } else if (connectionState === 'loading') {
    return (
      <div className="p-2 gap-2 text-gray-500 dark:text-gray-400 flex items-center">
        <Spinner />
        Loading
      </div>
    );
  } else {
    return (
      <span className="text-red-800 dark:text-red-400">Not connected</span>
    );
  }
};

const Spinner = () => {
  return (
    <div className="p-4 animate-spin w-4 h-4 border-b-2 border-gray-500 dark:border-gray-400 rounded-full"></div>
  );
};
