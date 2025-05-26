import { useCallback, useMemo, useState } from 'react';
import { NavBar } from '../components/nav';
import { useNavigate, useParams } from 'react-router';
import { useTxDataByHash } from '../betterfrost';
import { ErrorBox } from '../App';
import { TxViewer } from '../components/tx';
import { AnimatedSearchInput } from '../components/AnimatedSearchInput';
import { CopyBody } from '../components/layout/CopyBody';
import CommandPalette from '../components/CommandPalette';
import { MainLayout } from '../components/layout/Main';
import { KeyboardShortcut } from '../components/KeyboardShortcut';
import { Box } from '../components/layout/Box';
import { Footer } from '../components/layout/Footer';
import { SkipLink } from '../components/layout/A11y';

const TxHashForm = () => {
  const navigate = useNavigate();

  const [txHashValue, setTxHashValue] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (txHashValue.trim()) {
        navigate(`/submitted-tx/${txHashValue.trim()}`);
      }
    },
    [txHashValue, navigate],
  );

  return (
    <div className="mb-6 mt-4 mx-auto w-full bg-white dark:bg-gray-800 border-1 border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Transaction Lookup
        </h2>
        <div className="flex flex-row sm:flex-row items-start sm:items-center gap-1">
          <label
            htmlFor="tx-hash"
            className="text-sm min-w-[160px] font-medium text-gray-700 dark:text-gray-300"
          >
            Enter transaction hash:
          </label>
          <div className="w-full">
            <AnimatedSearchInput
              value={txHashValue}
              onChange={(e) => setTxHashValue(e.target.value)}
              onSubmit={handleSearch}
              placeholder="Enter transaction hash"
              id="tx-hash"
              name="tx-hash"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SubmittedTxPage = () => {
  const params = useParams();

  const txHash = useMemo(() => {
    return params.txHash ?? '';
  }, [params]);

  const txUrl = useMemo(() => {
    return `${window.location.href}`;
  }, []);

  const { data: txData, isError } = useTxDataByHash(txHash);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <SkipLink />

      <NavBar />

      <CommandPalette />

      <MainLayout ariaLabel="Submitted transaction page">
        {!txData && (
          <>
            <TxHashForm />
            <Box>
              Please enter a valid transaction hash to view it!
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Tip: you can also paste it directly in the search bar. Or use{' '}
                <KeyboardShortcut>Ctrl + K</KeyboardShortcut>.
              </span>
            </Box>
            {txHash.length > 0 && isError && (
              <ErrorBox message={'Could not load transaction'} />
            )}
          </>
        )}
        {txData && (
          <div>
            <CopyBody title="Transaction" value={txData.hash} url={txUrl} />
            <TxViewer tx={txData} />
          </div>
        )}
      </MainLayout>
      <Footer />
    </div>
  );
};
