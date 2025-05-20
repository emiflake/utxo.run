import { useCallback, useMemo, useState } from 'react';
import { processTxFromCbor } from '../tx';
import { TxViewer } from '../components/tx';
import { useNavigate, useParams } from 'react-router';
import { NavBar } from '../components/nav';
import { AnimatedSearchInput } from '../components/AnimatedSearchInput';
import { CopyBody } from '../components/layout/CopyBody';
import CommandPalette from '../components/CommandPalette';
import { MainLayout } from '../components/layout/Main';
import { Box } from '../components/layout/Box';
import { ErrorBox } from '../App';
import { KeyboardShortcut } from '../components/KeyboardShortcut';
import { Footer } from '../components/layout/Footer';

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

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <CommandPalette />

      <MainLayout>
        {!processedCbor.success && (
          <>
            <TxViewForm />
            <Box>
              Please enter a valid CBOR transaction to view it!
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Tip: you can also paste it directly in the search bar. Or use{' '}
                <KeyboardShortcut>Ctrl + K</KeyboardShortcut>.
              </span>
            </Box>
            {txCbor.length > 0 && processedCbor.error && (
              <ErrorBox message={processedCbor.error.message} />
            )}
          </>
        )}
        {processedCbor.success && (
          <div>
            <CopyBody
              title="Transaction"
              value={processedCbor.value.hash}
              url={window.location.href}
            />
            <TxViewer tx={processedCbor.value} />;
          </div>
        )}
      </MainLayout>
      <Footer />
    </div>
  );
}
