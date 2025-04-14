import { useTxDataByHash, useTxByHash } from '../betterfrost';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { ShimmerBox } from '../components/tx';
import { ErrorBox } from '../App';

export const MiniTransactionCard = ({ txHash }: { txHash: string }) => {
  const {
    data: txData,
    isLoading: isLoadingTxData,
    isError: isErrorTxData,
  } = useTxDataByHash(txHash);
  const {
    data: txInfo,
    isLoading: isLoadingTxInfo,
    isError: isErrorTxInfo,
  } = useTxByHash(txHash);

  const isLoading = isLoadingTxData || isLoadingTxInfo;
  const isError = isErrorTxData || isErrorTxInfo;

  const formattedDate = useMemo(() => {
    if (txInfo?.block_time) {
      const date = new Date(txInfo.block_time * 1000);
      return date.toLocaleString();
    }
    return null;
  }, [txInfo]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-800/50 hover:shadow-md transition-shadow duration-200">
      {isLoading && <ShimmerBox />}

      {!isLoading && (
        <div className="flex flex-col gap-1">
          {/* Transaction hash is always shown */}
          <div className="flex items-center justify-between">
            <Link
              to={`/submitted-tx/${txHash}`}
              className="text-indigo-500 dark:text-indigo-300 font-mono text-sm hover:underline truncate"
              title={txHash}
            >
              {txHash.slice(0, 10)}...{txHash.slice(-6)}
            </Link>

            {!isError && txInfo && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5">
                  {txInfo.size} bytes
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  #{txInfo.slot}
                </span>
              </div>
            )}
          </div>

          {/* Show error message if there's an error */}
          {isError && (
            <div className="mt-1">
              <ErrorBox message="Could not load transaction data" />
            </div>
          )}

          {/* Show transaction details if we have data */}
          {!isError && txData && txInfo && (
            <>
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-1 items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Block {txInfo.block_height}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 mx-1">
                    •
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formattedDate}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {txData.inputs.length} in → {txData.outputs.length} out
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                {txData.fee > 0 && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {(Number(txData.fee) / 1000000).toFixed(2)}₳
                  </span>
                )}
                {txData.mint && txData.mint.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    Mint
                  </span>
                )}
                {txData.burn && txData.burn.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    Burn
                  </span>
                )}
                {txData.requiredSigners &&
                  txData.requiredSigners.length >= 2 && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      Multisig
                    </span>
                  )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
