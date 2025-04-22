import { useState } from 'react';
import { CheckIcon, CopyIcon, LinkIcon } from './Icons';

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
