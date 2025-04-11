import { useCallback, useEffect, useState } from "react";

// Sun icon component
function SunIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

// Moon icon component
function MoonIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Toggle({
  isOn,
  onToggle,
  label,
  disabled = false,
  size = "md",
  className = "",
}: ToggleProps) {
  // Size mappings
  const sizeClasses = {
    sm: {
      toggle: "w-8 h-4",
      circle: "w-3 h-3",
      translateX: "translate-x-4",
    },
    md: {
      toggle: "w-11 h-6",
      circle: "w-5 h-5",
      translateX: "translate-x-5",
    },
    lg: {
      toggle: "w-14 h-7",
      circle: "w-6 h-6",
      translateX: "translate-x-7",
    },
  };

  const { toggle, circle, translateX } = sizeClasses[size];

  return (
    <div className={`flex items-center ${className}`}>
      {label && (
        <label className="mr-3 text-sm font-medium dark:text-white">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 items-center rounded-full
          ${toggle}
          ${isOn ? "bg-gray-500 dark:bg-gray-600" : "bg-gray-200 dark:bg-gray-700"}
          transition-colors duration-300 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-opacity-75
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-pressed={isOn}
        aria-label={label || "Toggle"}
      >
        <span className="sr-only">{label || "Toggle"}</span>
        <span
          className={`
            ${isOn ? translateX : "translate-x-0.5"}
            ${circle}
            bg-white dark:bg-gray-100
            rounded-full shadow transform
            transition-transform duration-300 ease-in-out
            absolute top-1/2 -translate-y-1/2
          `}
        />
      </button>
    </div>
  );
}

const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const setDarkMode = useCallback((mode: boolean) => {
    setIsDarkMode(mode);

    document.documentElement.classList.toggle("dark", mode);

    localStorage.theme = mode ? "dark" : "light";
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    setDarkMode(newMode);
  }, [isDarkMode, setDarkMode]);

  return { isDarkMode, setDarkMode, toggleDarkMode };
};

// Example of a theme toggle that could be used in the app
export function ThemeToggle() {
  // Check if dark mode is already enabled
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center gap-1.5">
      <SunIcon className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-amber-500 filter drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]'} transition-all duration-300`} />
      <Toggle
        isOn={isDarkMode}
        onToggle={toggleDarkMode}
        size="sm"
        className="mx-1"
      />
      <MoonIcon className={`h-4 w-4 ${isDarkMode ? 'text-indigo-300 filter drop-shadow-[0_0_3px_rgba(165,180,252,0.5)]' : 'text-gray-400'} transition-all duration-300`} />
    </div>
  );
}
