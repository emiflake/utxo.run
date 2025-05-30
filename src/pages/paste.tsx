import { useMemo } from 'react';
import { pasteInterfaces, pasteSchema } from '../paste';
import { usePaste } from '../paste';
import { useParams } from 'react-router';
import { SkipLink } from '../components/layout/A11y';
import { NavBar } from '../components/nav';
import CommandPalette from '../components/CommandPalette';
import { MainLayout } from '../components/layout/Main';
import { Footer } from '../components/layout/Footer';
import { ErrorBox } from '../App';
import { TxViewPage } from './transaction_cbor';
import { Box, BoxHeader } from '../components/layout/Box';
import { AddressPage } from './address';
import { SubmittedTxPage } from './submitted_tx';

export const HandlePaste = ({
  iface,
}: {
  iface: keyof typeof pasteInterfaces;
}) => {
  const params = useParams();

  const pasteId = useMemo(() => {
    return params.id ?? '';
  }, [params]);

  const { data } = usePaste(iface, pasteId);

  const pageData = useMemo(() => {
    if (!data) {
      return null;
    }

    const paste = pasteSchema.safeParse(data);
    if (!paste.success) {
      console.error('Failed to parse paste data:', paste.error);
      return null;
    }
    return paste.data.content;
  }, [data]);

  if (!pageData) {
    return (
      <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
        <SkipLink />

        <NavBar />

        <CommandPalette />

        <MainLayout ariaLabel="Paste page">
          <ErrorBox message="Failed to load paste data." />

          <Box>
            <BoxHeader title="What we got:" />

            {!!data && (
              <pre className="font-mono break-all whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
            {!data && <p>No paste data found.</p>}
          </Box>
        </MainLayout>

        <Footer />
      </div>
    );
  }

  if (pageData.type === 'cbor') {
    return <TxViewPage cbor={pageData.body} />;
  }

  if (pageData.type === 'address') {
    return <AddressPage address={pageData.body} />;
  }

  if (pageData.type === 'hash') {
    return <SubmittedTxPage txHash={pageData.body} />;
  }
};
