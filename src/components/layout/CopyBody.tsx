import { ClipboardButton } from '../ActionButtons';
import { LinkClipboardButton } from '../ActionButtons';

export const CopyBody = ({
  title,
  value,
  url,
}: {
  title: string;
  value: string;
  url: string;
}) => {
  return (
    <>
      <h2 className="dark:text-white">{title}</h2>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 dark:text-gray-300 font-mono">
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
    </>
  );
};
