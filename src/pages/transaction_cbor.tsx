import { useCallback, useMemo, useState } from "react";
import { processTxFromCbor } from "../tx";
import { TxViewer } from "../components/tx";
import { ErrorBox } from "../App";
import { useNavigate, useParams } from "react-router";
import { NavBar } from "../components/nav";

const TxViewForm = () => {
  const navigate = useNavigate()

  const [txCborValue, setTxCborValue] = useState("");

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (txCborValue.trim()) {
      navigate(`/tx/${txCborValue.trim()}`);
    }
  }, [txCborValue, navigate]);

  return (
    <div className="mb-6 mt-4 mx-auto w-full bg-white border border-2 border-gray-200 overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Transaction Viewer</h2>
        <form
          onSubmit={handleSearch}
          className="w-full"
        >
          <div className="flex flex-row sm:flex-row items-start sm:items-center gap-1">
            <label htmlFor="tx-cbor" className="text-sm min-w-[160px] font-medium text-gray-700">
              Enter transaction CBOR:
            </label>
            <div className="w-full flex">
              <div className="flex-grow">
                <input
                  type="text"
                  id="tx-cbor"
                  name="tx-cbor"
                  value={txCborValue}
                  onChange={(e) => setTxCborValue(e.target.value)}
                  className="flex-1 p-2 w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none scroll-none overflow-hidden h-10"
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-primary font-medium rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export function TxViewPage() {
  const params = useParams()

  const txCbor = useMemo(() => {
    return params.txCbor ?? "";
  }, [params]);

  const processedCbor = useMemo(() => {
    return processTxFromCbor(txCbor);
  }, [txCbor]);

  const view = useMemo(() => {
    if (processedCbor.success) {
      return <TxViewer tx={processedCbor.value} />;
    } else if (txCbor.length === 0) {
      return (
        <div className="flex flex-col p-4 border-2 border-gray-200 gap-2">
          Please enter a CBOR transaction to view it!
        </div>
      );
    } else {
      return <ErrorBox message={processedCbor.error.message} />;
    }
  }, [txCbor, processedCbor]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5">
      <NavBar />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">
          {!processedCbor.success && <TxViewForm />}
          {view}
        </main>
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className=""></footer>
    </div>
  );
}
