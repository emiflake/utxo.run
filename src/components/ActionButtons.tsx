import { useState } from 'react';

// Utility functions
async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) {
    console.warn('Clipboard API not available');
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

// Icons
function CheckIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function CopyIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function LinkIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  );
}

// Base component for action buttons
interface ActionButtonProps {
  className?: string;
  title: string;
  ariaLabel?: string;
  onClick: () => void;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  isActive?: boolean;
}

function ActionButton({
  className = 'text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-200',
  title,
  ariaLabel,
  onClick,
  icon,
  activeIcon,
  isActive = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 p-1 text-xs focus:outline-none transition-colors duration-200 ${className}`}
      title={title}
      aria-label={ariaLabel || title}
    >
      <div className="relative w-3.5 h-3.5 flex items-center justify-center">
        {isActive && activeIcon ? (
          <div className="absolute inset-0">{activeIcon}</div>
        ) : (
          <div className="absolute inset-0">{icon}</div>
        )}
      </div>
    </button>
  );
}

// Specific implementations
interface ClipboardButtonProps {
  text: string;
  className?: string;
  copyDuration?: number;
}

export function ClipboardButton({
  text,
  className = 'text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-200',
  copyDuration = 500,
}: ClipboardButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), copyDuration);
    }
  };

  return (
    <ActionButton
      className={className}
      title="Copy this to clipboard"
      onClick={handleCopy}
      icon={<CopyIcon />}
      activeIcon={<CheckIcon className="text-green-500 dark:text-green-400" />}
      isActive={copied}
    />
  );
}

interface LinkClipboardButtonProps {
  text: string;
  className?: string;
  copyDuration?: number;
}

export function LinkClipboardButton({
  text,
  className = 'text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-200',
  copyDuration = 500,
}: LinkClipboardButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), copyDuration);
    }
  };

  return (
    <ActionButton
      className={className}
      title="Copy link to clipboard"
      onClick={handleCopy}
      icon={<LinkIcon />}
      activeIcon={<CheckIcon className="text-green-500 dark:text-green-400" />}
      isActive={copied}
    />
  );
}
