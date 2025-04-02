import { useCallback, useMemo } from "react";
import { processTxFromCbor } from "../tx";
import { TxViewer } from "../components/tx";
import { CborInput, ErrorBox } from "../App";
import { useSearchParams } from "react-router";
import { NavBar } from "../components/nav";

export function TxViewPage() {
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
