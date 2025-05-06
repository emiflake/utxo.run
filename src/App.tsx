import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router';

import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RegistryPage } from './pages/registry';
import { ChainPage } from './pages/chain';
import { SubmittedTxPage } from './pages/submitted_tx';
import { AddressPage } from './pages/address';
import { TxViewPage } from './pages/transaction_cbor';
import { PolicyPage } from './pages/policy';
import { RegistryProvider } from './registry_context';
import { BlueprintPage } from './pages/blueprint';

const queryClient = new QueryClient();

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <RegistryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<TxViewPage />} />

            <Route path="/tx/:txCbor?" element={<TxViewPage />} />
            <Route path="/registry" element={<RegistryPage />} />
            <Route path="/chain" element={<ChainPage />} />
            <Route path="/policy/:unit" element={<PolicyPage />} />
            <Route
              path="/submitted-tx/:txHash?"
              element={<SubmittedTxPage />}
            />
            <Route path="/address/:address" element={<AddressPage />} />
            <Route path="/blueprint" element={<BlueprintPage />} />
          </Routes>
        </Router>
        <ReactQueryDevtools initialIsOpen />
      </RegistryProvider>
    </PersistQueryClientProvider>
  );
}

const isJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export type ErrorBoxProps = { message: string };

export const ErrorBox = ({ message }: ErrorBoxProps) => {
  // Card for error messages
  return (
    <div className="border border-red-200 dark:border-red-800 p-3 bg-red-50 dark:bg-red-900/30 flex items-begin gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-red-500 dark:text-red-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {isJSON(message) ? (
        <pre className="text-red-700 dark:text-red-300 text-sm font-mono">
          {JSON.stringify(JSON.parse(message), null, 2)}
        </pre>
      ) : (
        <div className="text-red-700 dark:text-red-300 text-sm">{message}</div>
      )}
    </div>
  );
};

export const CborInput = ({
  cbor,
  setCbor,
}: {
  cbor: string;
  setCbor: (cbor: string) => void;
}) => {
  return (
    <textarea
      className="flex-1 p-2 max-w-100 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 resize-none scroll-none overflow-hidden h-10"
      value={cbor}
      onChange={(e) => {
        setCbor(e.target.value);
      }}
      wrap="off"
      rows={1}
    />
  );
};

export default App;
