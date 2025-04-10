import { useCallback, useEffect, useMemo, useState } from "react";
import { NavBar } from "../components/nav";
import { useLocation, useNavigate, useParams } from "react-router";
import { useTxDataByHash } from "../betterfrost";
import { ErrorBox } from "../App";
import { ShimmerBox, TxViewer } from "../components/tx";
import { AnimatedSearchInput } from "../components/AnimatedSearchInput";
import { ClipboardButton, LinkClipboardButton } from "../components/ActionButtons";

const TxHashForm = () => {
  const navigate = useNavigate()

  const [txHashValue, setTxHashValue] = useState("");

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (txHashValue.trim()) {
      navigate(`/submitted-tx/${txHashValue.trim()}`);
    }
  }, [txHashValue, navigate]);

  return (
    <div className="mb-6 mt-4 mx-auto w-full bg-white border border-2 border-gray-200 overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Transaction Lookup</h2>
        <div className="flex flex-row sm:flex-row items-start sm:items-center gap-1">
          <label htmlFor="tx-hash" className="text-sm min-w-[160px] font-medium text-gray-700">
            Enter transaction hash:
          </label>
          <div className="w-full">
            <AnimatedSearchInput
              value={txHashValue}
              onChange={(e) => setTxHashValue(e.target.value)}
              onSubmit={handleSearch}
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
  const params = useParams()

  const txHash = useMemo(() => {
    return params.txHash ?? "";
  }, [params]);


  const txUrl = useMemo(() => {
    return `${window.location.href}`;
  }, []);

  const { data: txData, isLoading, isError } = useTxDataByHash(txHash);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5">
      <NavBar />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">

          {txData && (
            <>
            <h2>Transaction</h2>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-mono">{txHash}</span>
                <ClipboardButton text={txHash} className="opacity-70 hover:opacity-100" />
                <LinkClipboardButton text={txUrl} className="opacity-70 hover:opacity-100" />
              </div>
            </>
          )}

          {!txData && <TxHashForm />}
          {txHash && (
            <>
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
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className=""></footer>
    </div>
  );
};
