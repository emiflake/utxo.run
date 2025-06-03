// Three dots with non-native menu
import React, { useRef } from 'react';
import { DotsVerticalIcon } from '../Icons';

export type ThreeDotsMenuItem = {
  label: string | React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

interface ThreeDotsProps {
  name?: string;
  description?: string;
  iconClassName?: string;
}

export const ThreeDots: React.FC<ThreeDotsProps> = ({
  name,
  description,
  iconClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div
        aria-haspopup="menu"
        aria-label={name}
        aria-description={description}
        className={
          'flex items-center justify-center rounded-full p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ' +
          iconClassName
        }
      >
        <DotsVerticalIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
      </div>
    </div>
  );
};
