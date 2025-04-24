import React, { useMemo } from 'react';
import { ogmiosURL } from '../ogmios';
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
          <div className="flex flex-col gap-2">
            <label
              htmlFor="ogmios-url"
              className="text-sm font-medium dark:text-white"
            >
              Ogmios URL:
            </label>
            <input
              type="text"
              id="ogmios-url"
              value={ogmiosURL}
              disabled
              className="border rounded p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
              title="This is disabled because it is set in the environment"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="betterfrost-url" className="dark:text-white">
              Betterfrost URL:
            </label>
            <input
              type="text"
              id="betterfrost-url"
              value={betterfrostURL}
              disabled
              className="border rounded p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
              title="This is disabled because it is set in the environment"
            />
            <ConnectionState connectionState={betterfrostConnectionState} />
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
