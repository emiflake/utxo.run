import { useMemo } from "react";
import { NavBar } from "../components/nav";
import { useUtxosByAddress } from "../betterfrost";
import { useParams } from "react-router";
import { ShimmerBox, ViewTransactionOutput, ViewUnit } from "../components/tx";
import { TransactionOutput } from "../tx";
import { ErrorBox } from "../App";

export const AddressPage = () => {
  const params = useParams()

  const address = useMemo(() => {
    return params.address ?? "";
  }, [params]);

  const { data: utxos, isLoading, isError } = useUtxosByAddress(address);

  const totalValue = useMemo(() => {
    // Map from unit to amount
    if (utxos) {
      const total: Record<string, bigint> = {};
      for (const utxo of utxos) {
        for (const amount of utxo.amount) {
          if (total[amount.unit] === undefined) {
            total[amount.unit] = 0n;
          }
          total[amount.unit] += BigInt(amount.quantity);
        }
      }
      return total;
    } else {
      return {};
    }
  }, [utxos]);

  const processedUtxos: TransactionOutput[] = useMemo(() => {
    if (utxos) {
      return utxos.map((utxo) => ({
        address: utxo.address,
        coin: 0n,
        amount: utxo.amount,
        tx_hash: utxo.tx_hash,
        cbor_datum: utxo.data_hash ?? "",
      }));
    } else {
      return [];
    }
  }, [utxos]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5">
      <NavBar>
      </NavBar>

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">
          <h2>Address {address}</h2>

          <div className="flex gap-2 border-2 border-gray-200 p-4">
            {isLoading && <ShimmerBox />}
            {isError && <ErrorBox message={"Could not load outputs"} />}
            {utxos && (
              <>
                <div className="flex flex-col w-1/2 gap-2 border-2 border-gray-200 p-4">
                  <span className="text-md">Outputs</span>
                  {utxos && <span className="text-xs">Count: {utxos.length}</span>}
                  {processedUtxos?.map((utxo) => (
                    <ViewTransactionOutput
                      key={utxo.tx_hash}
                      output={utxo}
                      showTxHash={true}
                    />
                  ))}
                </div>
                <div className="flex flex-col w-1/2 gap-2 border-2 border-gray-200 p-4">
                  <span className="text-md">Total asset value</span>
                  {totalValue && (
                    <span className="text-xs">
                      Count: {Object.entries(totalValue).length}
                    </span>
                  )}
                  {totalValue &&
                    Object.entries(totalValue).map(([k, v]) => (
                      <ViewUnit key={k} unit={k} quantity={v.toString()} />
                    ))}
                </div>
              </>
            )}
          </div>
        </main>
        <nav className="order-first sm:w-32"></nav>

        <aside className="sm:w-32"></aside>
      </div>
      <footer className=""></footer>
    </div>
  );
};
