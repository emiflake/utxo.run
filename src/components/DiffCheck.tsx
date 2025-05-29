import { CheckIcon } from './Icons';

export const DiffCheckbox = ({
  checked,
  setChecked,
  onChecked,
  ref,
  label,
  disabled = false,
  count,
  maxCount,
  className = '',
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  onChecked?: (checked: boolean) => void;
  ref?: React.RefObject<HTMLInputElement | null>;
  // We have checked count out of maxCount boxes.
  count: number;
  maxCount: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}) => {
  // Don't render anything when disabled
  if (disabled) {
    return null;
  }

  return (
    <div className="flex items-center">
      <label className="gap-1 relative inline-flex items-center cursor-pointer">
        {label && (
          <span className="ml-3 text-sm font-medium text-white dark:text-gray-300">
            {label}:
          </span>
        )}

        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            onChecked?.(e.target.checked);
          }}
        />
        <div
          className={`w-5 h-5 bg-gray-800 transition-all duration-200 hover:bg-gray-700 hover:border-blue-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-600 peer dark:bg-gray-900 border-[3px] border-gray-600 flex items-center justify-center shadow-md ${className}`}
        >
          {checked && <CheckIcon className="w-4 h-4 text-blue-400" />}
        </div>
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-500">
          {count}/{maxCount}
        </span>
      </label>
    </div>
  );
};
