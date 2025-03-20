import { useCallback, useMemo } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useSearchParams,
} from "react-router";

import { TxViewer } from "./components/tx";

import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RegistryPage } from "./pages/registry";
import { NavBar } from "./components/nav";
import { processTx } from "./tx";

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
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen />
    </PersistQueryClientProvider>
  );
}

function TxViewPage() {
  const [searchParams, setSearchParams] = useSearchParams({
    txCbor: "",
  });

  const txCbor = useMemo(() => {
    return searchParams.get("txCbor") ?? "";
  }, [searchParams]);

  const setTxCbor = useCallback(
    (txCbor: string) => {
      searchParams.set("txCbor", txCbor);
      setSearchParams(searchParams);
    },
    [setSearchParams, searchParams],
  );

  const processedCbor = useMemo(() => {
    return processTx(txCbor);
  }, [txCbor]);

  const view = useMemo(() => {
    if (processedCbor.success) {
      return <TxViewer tx={processedCbor} />;
    } else if (txCbor.length === 0) {
      return (
        <div className="flex flex-col p-4 border-2 border-gray-200 gap-2">
          Please enter a CBOR transaction to view it!
        </div>
      );
    } else {
      return <ErrorBox message={processedCbor.message} />;
    }
  }, [txCbor, processedCbor]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5">
      <NavBar>
        <span className="self-center text-xs text-gray-500">
          Enter your CBOR transaction here:
        </span>

        <CborInput cbor={txCbor} setCbor={setTxCbor} />
      </NavBar>

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">{view}</main>
        <nav className="order-first sm:w-32"></nav>

        <aside className="sm:w-32"></aside>
      </div>
      <footer className=""></footer>
    </div>
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
        console.log(e);
        setCbor(e.target.value);
      }}
      wrap="off"
      rows={1}
    />
  );
};

export default App;
