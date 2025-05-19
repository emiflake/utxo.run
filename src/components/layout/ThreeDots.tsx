// Three dots with non-native menu
import React, { useRef, useState, useEffect } from 'react';
import { DotsVerticalIcon } from '../Icons';

export type ThreeDotsMenuItem = {
  label: string | React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

interface ThreeDotsProps {
  children: React.ReactNode;
  iconClassName?: string;
}

export const ThreeDots: React.FC<ThreeDotsProps> = ({
  children,
  iconClassName = '',
}) => {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.relatedTarget as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block text-left"
      onBlur={handleBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          'flex items-center justify-center rounded-full p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ' +
          iconClassName
        }
        onClick={() => setOpen((v) => !v)}
      >
        <DotsVerticalIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
      </button>
      {open && (
        <div
          ref={menuRef}
          className={
            'absolute right-0 mt-2 shadow-lg bg-white dark:text-gray-200 dark:bg-gray-900 p-1 border border-zinc-200 dark:border-zinc-700 py-1 z-50 w-max'
          }
          role="menu"
          tabIndex={-1}
        >
          {children}
        </div>
      )}
    </div>
  );
};
