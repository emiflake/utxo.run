import { Transaction } from '@/tx';
import { ClipboardButton, FeedbackButton } from '../ActionButtons';
import { LinkClipboardButton } from '../ActionButtons';
import { ThreeDots } from './ThreeDots';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CodeIcon, LinkIcon } from 'lucide-react';

/**
 * A header for a generic page.
 */
export const PageTitle = ({
  title,
  value,
  url,
}: {
  title: string;
  value: string;
  url: string;
}) => {
  return (
    <div className="flex flex-col md:p-0 p-2">
      <h2 className="dark:text-white">{title}</h2>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 dark:text-gray-300 font-mono break-all">
          {value}
        </span>
        <ClipboardButton
          text={value}
          className="opacity-70 hover:opacity-100 dark:text-white"
        />
        <LinkClipboardButton
          text={url}
          className="opacity-70 hover:opacity-100 dark:text-white"
        />
      </div>
    </div>
  );
};

/**
 * A header for transactions.
 * This shows the transaction hash and allows you to copy either the hash, the link or the CBOR to your clipboard.
 */
export const TransactionTitle = ({ tx }: { tx: Transaction }) => {
  return (
    <div className="flex flex-col md:p-0 p-2">
      <h2 className="dark:text-white">Transaction</h2>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 dark:text-gray-300 font-mono break-all">
          {tx.hash}
        </span>
        <ClipboardButton
          text={tx.hash}
          className="opacity-70 hover:opacity-100 dark:text-white"
        />
        <Popover>
          <PopoverTrigger>
            <ThreeDots />
          </PopoverTrigger>
          <PopoverContent
            className="min-w-40 p-1 max-h-[calc(var(--radix-popover-content-available-height))] overflow-auto"
            side="bottom"
            align="center"
          >
            <div className="flex flex-col min-w-0 p-1 w-full text-xs break-all">
              <h3 className="text-xs font-medium p-1 text-gray-700 dark:text-gray-300 text-center select-none">
                Actions
              </h3>

              <FeedbackButton
                variant="link"
                className="w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                duration={500}
                onClick={() => {
                  navigator.clipboard.writeText(tx.cbor);
                }}
              >
                Copy transaction CBOR
                <CodeIcon />
              </FeedbackButton>

              <FeedbackButton
                variant="link"
                className="w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                duration={500}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                Copy transaction link
                <LinkIcon />
              </FeedbackButton>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
