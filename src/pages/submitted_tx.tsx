import { useCallback, useMemo } from "react";
import { NavBar } from "../components/nav";
import { useNavigate, useParams } from "react-router";
import { useTxData } from "../betterfrost";
import { ErrorBox } from "../App";
import { ShimmerBox, TxViewer } from "../components/tx";

export const HashInput = ({
  hash,
  setHash,
}: {
  hash: string;
  setHash: (hash: string) => void;
}) => {
  return (
    <textarea
      className="flex-1 p-2 max-w-100 border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none scroll-none overflow-hidden h-10"
      value={hash}
      onChange={(e) => {
        setHash(e.target.value);
      }}
      wrap="off"
      rows={1}
    />
  );
};

export const SubmittedTxPage = () => {
  const params = useParams()

  const txHash = useMemo(() => {
    return params.txHash ?? "";
  }, [params]);
  const navigate = useNavigate()

  const setTxHash = useCallback(
    (txHash: string) => {
      navigate(`/submitted-tx/${txHash}`)
    },
    [navigate],
  );

  const { data: txData, isLoading, isError } = useTxData(txHash);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5">
      <NavBar>
        <span className="self-center text-xs text-gray-500">
          Enter your transaction hash here:
        </span>

        <HashInput hash={txHash} setHash={setTxHash} />
      </NavBar>

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">
          {txHash && (
            <>
              <h2>Transaction {txHash}</h2>
              {txData && <TxViewer tx={txData} />}
              {isLoading && <ShimmerBox />}
              {isError && <ErrorBox message={"Could not load transaction"} />}
            </>
          )}
          {!txHash && (
            <div className="flex flex-col p-4 border-2 border-gray-200 gap-2">
              Please enter a transaction hash to view it!
            </div>
          )}
        </main>
        <nav className="order-first sm:w-32"></nav>

        <aside className="sm:w-32"></aside>
      </div>
      <footer className=""></footer>
    </div>
  );
};
