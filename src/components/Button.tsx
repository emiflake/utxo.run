export type IconButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
};

export const IconButton = ({
  onClick,
  disabled = false,
  ariaLabel,
  children,
}: IconButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center h-8 w-8 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};
