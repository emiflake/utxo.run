import { ErrorBox } from "../App";
import {
  betterfrostURL,
  Block,
  useLatestBlock,
} from "../betterfrost";
import { NavBar } from "../components/nav";
import { ShimmerBox } from "../components/tx";
import {
  QueryLedgerStateUtxosResponse,
  useQueryLedgerStateUtxos,
} from "../ogmios";
import { Link } from "react-router";

export const ViewBlock = ({ block }: { block: Block }) => {
  return (
    <div className="flex flex-col gap-2 border-2 border-gray-200 p-4">
      <span className="text-xs">Block</span>
      <div className="flex flex-col gap-2">
        <span className="text-xs">Hash: {block?.hash}</span>
        <span className="text-xs">Time: {block?.time ?? 0}</span>
        <span className="text-xs">Height: {block?.height}</span>
        <span className="text-xs">Size: {block?.size}</span>
        <span className="text-xs">Slot: {block?.slot}</span>
        <span className="text-xs">Epoch: {block?.epoch}</span>
        <span className="text-xs">Epoch slot: {block?.epoch_slot}</span>
        <span className="text-xs">Slot leader: {block?.slot_leader}</span>
        <span className="text-xs">Tx count: {block?.tx_count}</span>
        <span className="text-xs">Confirmations: {block?.confirmations}</span>
      </div>
    </div>
  );
};
export const ViewLatestBlock = () => {
  const { data: latestBlock, isLoading, isError } = useLatestBlock();

  if (isLoading) {
    return <ShimmerBox />;
  }

  if (isError) {
    return <ErrorBox message={"Could not load latest block"} />;
  }

  if (latestBlock !== undefined) {
    return <ViewBlock block={latestBlock} />;
  }
};

export const ViewUtxo = ({
  utxo,
}: {
  utxo: QueryLedgerStateUtxosResponse["result"][0];
}) => {
  return (
    <div className="flex flex-col gap-2 border-2 border-gray-200 p-4">
      <span className="text-xs">UTXO</span>
      <div className="flex flex-col gap-2">
        <span className="text-xs">Index: {utxo.index}</span>
        <span className="text-xs">
          Transaction ID: {" "}
          <Link
            to={`/submitted-tx/${utxo.transaction.id}`}
            className="text-indigo-500 hover:underline"
          >
            {utxo.transaction.id}
          </Link>
        </span>
      </div>
    </div>
  );
};
export const ViewUtxos = () => {
  const { data: utxos, isLoading, isError } = useQueryLedgerStateUtxos();

  if (isLoading) {
    return <ShimmerBox />;
  }

  if (isError) {
    return <ErrorBox message={"Could not load utxos"} />;
  }

  return (
    <div className="flex flex-col gap-2 border dotted border-gray-200 p-4">
      <span className="text-xs">UTXOs</span>
      <div className="flex flex-col gap-2">
        {utxos?.result && (
          <span className="text-xs">UTXOs: {utxos.result.length}</span>
        )}
        {utxos?.result && (
          <div className="flex flex-col gap-2">
            {utxos.result.map((utxo) => (
              <ViewUtxo utxo={utxo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChainPage = () => {
  
  return (
    <div className="min-h-screen flex flex-col p-1 gap-5">
      <NavBar />

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2">
          <h2>Chain explorer</h2>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500">
              Running against betterfrost {betterfrostURL}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:flex-1 gap-2">
            <div className="flex flex-col gap-2 lg:w-1/2 border dotted border-gray-200 p-4">
              <p className="text-md">Latest block</p>
              <ViewLatestBlock />
            </div>

            <div className="flex flex-col gap-2 lg:w-1/2">
              <ViewUtxos />
            </div>
          </div>
        </main>
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className="bg-gray-100"></footer>
    </div>
  );
};
