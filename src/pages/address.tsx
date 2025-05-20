import { useMemo } from 'react';
import { NavBar } from '../components/nav';
import { useUtxosByAddress } from '../betterfrost';
import { useParams } from 'react-router';
import { ShimmerBox, ViewTransactionOutput, ViewUnit } from '../components/tx';
import { addressInfo, TransactionOutput } from '../tx';
import { ErrorBox } from '../App';
import { scriptInfoByAddress, useRegistry } from '../registry';
import { ScriptInfo } from '../components/ScriptInfo';
import { CopyBody } from '../components/layout/CopyBody';
import { Box, BoxHeader } from '../components/layout/Box';
import { MonoTag } from '../components/MiniTag';
import CommandPalette from '../components/CommandPalette';
import { MainLayout } from '../components/layout/Main';
import { Footer } from '../components/layout/Footer';

const outputKey = (output: TransactionOutput) => {
  return `${output.tx_hash}-${output.index}`;
};

export const AddressPage = () => {
  const params = useParams();

  const address = useMemo(() => {
    return params.address ?? '';
  }, [params]);

  const addrInfo = useMemo(() => {
    return addressInfo(address);
  }, [address]);

  const addressUrl = useMemo(() => {
    return `${window.location.href}`;
  }, []);

  const { data: utxos, isLoading, isError } = useUtxosByAddress(address);

  const registryQuery = useRegistry();

  const scriptInfo = useMemo(() => {
    if (registryQuery.data) {
      return scriptInfoByAddress(registryQuery.data, address);
    }
    return undefined;
  }, [address, registryQuery.data]);

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
      return utxos.map(
        (utxo, i) =>
          ({
            address: utxo.address,
            coin: 0n,
            amount: utxo.amount,
            tx_hash: utxo.tx_hash,
            cbor_datum: utxo.inline_datum ? utxo.inline_datum : undefined,
            index: BigInt(i),
          }) satisfies TransactionOutput,
      );
    } else {
      return [];
    }
  }, [utxos]);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar />

      <CommandPalette />

      <MainLayout>
        <CopyBody title="Address" value={address} url={addressUrl} />
        {scriptInfo && <ScriptInfo script={scriptInfo} />}

        <Box>
          <BoxHeader title="Address info"></BoxHeader>
          <div className="flex flex-wrap gap-2 p-2">
            {addrInfo.paymentCredential && (
              <MonoTag
                label="Payment credential"
                value={addrInfo.paymentCredential}
              />
            )}
            {addrInfo.stakingCredential && (
              <MonoTag
                label="Staking credential"
                value={addrInfo.stakingCredential}
              />
            )}
          </div>
        </Box>

        <div className="flex flex-col lg:flex-row lg:flex-1 gap-2">
          {isLoading && <ShimmerBox />}
          {isError && <ErrorBox message={'Could not load outputs'} />}
          {utxos && (
            <>
              <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
                <span className="text-md dark:text-white">Outputs</span>
                {utxos && (
                  <span className="text-xs dark:text-gray-300">
                    Count: {utxos.length}
                  </span>
                )}
                {processedUtxos?.map((utxo) => (
                  <ViewTransactionOutput key={outputKey(utxo)} output={utxo} />
                ))}
              </div>
              <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
                <span className="text-md dark:text-white">
                  Total asset value
                </span>
                {totalValue && (
                  <span className="text-xs dark:text-gray-300">
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
      </MainLayout>
      <Footer />
    </div>
  );
};
