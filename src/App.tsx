import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router";


import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RegistryPage } from "./pages/registry";
import { ChainPage } from "./pages/chain";
import { SubmittedTxPage } from "./pages/submitted_tx";
import { AddressPage } from "./pages/address";
import { TxViewPage } from "./pages/transaction_cbor";

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
      <Router>
        <Routes>
          <Route path="/" element={<TxViewPage />} />
          <Route path="/registry" element={<RegistryPage />} />
          <Route path="/chain" element={<ChainPage />} />
          <Route path="/submitted-tx" element={<SubmittedTxPage />} />
          <Route path="/address" element={<AddressPage />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen />
    </PersistQueryClientProvider>
  );
}
export const ErrorBox = ({ message }: { message: string }) => {
  // Card for error messages
  return (
    <div className="border-2 p-4 border-gray-200">
      <img src="warn.svg" alt="Error" className="inline-block w-6 h-6 mr-2" />
      <div className="text-red-900">{message}</div>
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
      className="flex-1 p-2 max-w-100 border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none scroll-none overflow-hidden h-10"
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
