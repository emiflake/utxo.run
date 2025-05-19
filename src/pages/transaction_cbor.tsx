import { useCallback, useMemo, useState } from 'react';
import { processTxFromCbor } from '../tx';
import { TxViewer } from '../components/tx';
import { ErrorBox } from '../App';
import { useNavigate, useParams } from 'react-router';
import { NavBar } from '../components/nav';
import { AnimatedSearchInput } from '../components/AnimatedSearchInput';
import { CopyBody } from '../components/layout/CopyBody';
import CommandPalette from '../components/CommandPalette';

const TxViewForm = () => {
  const navigate = useNavigate();

  const [txCborValue, setTxCborValue] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (txCborValue.trim()) {
        navigate(`/tx/${txCborValue.trim()}`);
      }
    },
    [txCborValue, navigate],
  );

  return (
    <div className="mb-6 mt-4 mx-auto w-full bg-white dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Transaction Viewer
        </h2>
        <div className="flex flex-row sm:flex-row items-start sm:items-center gap-1">
          <label
            htmlFor="tx-cbor"
            className="text-sm min-w-[160px] font-medium text-gray-700 dark:text-gray-300"
          >
            Enter transaction CBOR:
          </label>
          <div className="w-full">
            <AnimatedSearchInput
              value={txCborValue}
              onChange={(e) => setTxCborValue(e.target.value)}
              onSubmit={handleSearch}
              id="tx-cbor"
              name="tx-cbor"
              buttonText="Submit"
              placeholder="Transaction CBOR here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export function TxViewPage() {
  const params = useParams();

  const txCbor = useMemo(() => {
    return params.txCbor ?? '';
  }, [params]);

  const processedCbor = useMemo(() => {
    return processTxFromCbor(txCbor);
  }, [txCbor]);

  const view = useMemo(() => {
    if (processedCbor.success) {
      return (
        <div>
          <CopyBody
            title="Transaction"
            value={processedCbor.value.hash}
            url={window.location.href}
          />
          <TxViewer tx={processedCbor.value} />;
        </div>
      );
    } else if (txCbor.length === 0) {
      return (
        <div className="flex flex-col p-4 border border-gray-200 dark:border-gray-700 gap-2 dark:text-white">
          Please enter a CBOR transaction to view it!
        </div>
      );
    } else {
      return <ErrorBox message={processedCbor.error.message} />;
    }
  }, [txCbor, processedCbor]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <CommandPalette />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col">
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
