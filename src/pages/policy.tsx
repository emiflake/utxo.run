import { useParams } from 'react-router';
import { NavBar } from '../components/nav';
import { useEffect, useMemo } from 'react';
import {
  AssetHistory,
  AssetTransaction,
  useAssetHistory,
  useAssetTransactions,
} from '../betterfrost';
import { ShimmerBox } from '../components/tx';
import { ErrorBox } from '../App';
import { MiniTransactionCard } from '../components/MiniTx';
import { useRegistry } from '../registry';
import { ScriptInfo } from '../components/ScriptInfo';
import { CopyBody } from '../components/layout/CopyBody';
import CommandPalette from '../components/CommandPalette';
import { MainLayout } from '../components/layout/Main';
import { Footer } from '../components/layout/Footer';
import { SkipLink } from '../components/layout/A11y';

const ViewAssetTransactions = ({
  assetTransactions,
  isLoading,
  isError,
}: {
  assetTransactions: AssetTransaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  return (
    <>
      {assetTransactions && (
        <>
          <span className="text-md dark:text-white">Transactions</span>
          {assetTransactions && (
            <span className="text-xs dark:text-gray-300">
              Count: {assetTransactions.length}
            </span>
          )}
          <div className="grid grid-cols-1 gap-3 mt-2">
            {assetTransactions?.map(
              (transaction) =>
                transaction.tx_hash && (
                  <MiniTransactionCard
                    key={transaction.tx_hash}
                    txHash={transaction.tx_hash}
                  />
                ),
            )}
          </div>
        </>
      )}
      {isLoading && <ShimmerBox />}
      {isError && <ErrorBox message={'Could not load transactions'} />}
    </>
  );
};

const ViewAssetHistory = ({
  assetHistory,
  isLoading,
  isError,
}: {
  assetHistory: AssetHistory[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  const displayHistory = assetHistory;
  return (
    <>
      {displayHistory && (
        <>
          <span className="text-md dark:text-white">Token History</span>
          <span className="text-xs dark:text-gray-300">
            Count: {displayHistory.length}
          </span>
          <div className="space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-2">
            {displayHistory.map((history) => {
              const isMint = history.action.toLowerCase().includes('mint');
              const isBurn = history.action.toLowerCase().includes('burn');

              let dotColor = 'bg-gray-400 dark:bg-gray-500';
              let labelColor = 'text-gray-500 dark:text-gray-400';

              if (isMint) {
                dotColor = 'bg-green-500 dark:bg-green-400';
                labelColor = 'text-green-600 dark:text-green-400';
              } else if (isBurn) {
                dotColor = 'bg-red-500 dark:bg-red-400';
                labelColor = 'text-red-600 dark:text-red-400';
              }

              return (
                <div key={history.tx_hash} className="relative pb-4">
                  {/* Timeline dot */}
                  <div
                    className={`absolute w-4 h-4 rounded-full ${dotColor} -left-6 top-0 border-2 border-white dark:border-gray-900`}
                  ></div>

                  {/* Action label */}
                  <div className={`${labelColor} text-sm font-medium mb-1`}>
                    {history.action}
                  </div>

                  {/* Transaction card */}
                  <MiniTransactionCard txHash={history.tx_hash} />
                </div>
              );
            })}
          </div>
        </>
      )}
      {isLoading && <ShimmerBox />}
      {isError && <ErrorBox message={'Could not load token history'} />}
    </>
  );
};

export const PolicyPage = () => {
  const params = useParams();

  const policy = useMemo(() => {
    const unit = params.unit ?? '';
    if (unit === 'lovelace') {
      return '';
    } else {
      return unit;
    }
  }, [params]);

  const policyUrl = useMemo(() => {
    return `${window.location.href}`;
  }, []);

  const { data: assetHistory, isLoading, isError } = useAssetHistory(policy);
  const {
    data: assetTransactions,
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
  } = useAssetTransactions(policy);

  const registryQuery = useRegistry();

  const relevantScript = useMemo(() => {
    return registryQuery.data?.scriptInfos.find(
      (script) => script.scriptHash === policy,
    );
  }, [registryQuery.data, policy]);

  useEffect(() => {
    document.title = policy ? `policy ${policy}` : 'utxo.run | policy';
  }, [policy]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <SkipLink />

      <NavBar />

      <CommandPalette />

      <MainLayout>
        <CopyBody title="Policy" value={policy} url={policyUrl} />

        {/* Token information, if available */}
        {registryQuery.data && relevantScript && (
          <ScriptInfo script={relevantScript} />
        )}

        <div className="flex flex-col lg:flex-row lg:flex-1 gap-2">
          <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
            <ViewAssetTransactions
              assetTransactions={assetTransactions}
              isLoading={isLoadingTransactions}
              isError={isErrorTransactions}
            />
          </div>
          <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
            <ViewAssetHistory
              assetHistory={assetHistory}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
        </div>
      </MainLayout>
      <Footer />
    </div>
  );
};
