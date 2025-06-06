import { useState, FormEvent, ChangeEvent } from 'react';

interface AnimatedSearchInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  placeholder?: string;
  id?: string;
  ref?: React.RefObject<HTMLInputElement | null>;
  name?: string;
  type?: string;
  title?: string;
  buttonText?: string;
  className?: string;
  inputClassName?: string;
}

export function AnimatedSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  id,
  ref,
  name,
  type = 'text',
  title,
  buttonText = 'Search',
  className = '',
  inputClassName = '',
}: AnimatedSearchInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);

  // This is required so that the form doesn't submit when the user hits enter or clicks the button.
  // This way navigation happens much more smoothly.
  const localOnSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={localOnSubmit} className={`flex items-center ${className}`}>
      <div className="relative flex-grow group">
        <input
          type={type}
          id={id}
          name={name}
          role="searchbox"
          value={value}
          onChange={onChange}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder={placeholder}
          aria-description="Search"
          title={title}
          className={`h-10 w-full 
            ${
              isInputFocused ? 'rounded-l' : 'rounded'
            } border-2 border-gray-200 dark:border-gray-700 p-2 
            focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 transition-all duration-300 ease-in-out 
            relative z-10 bg-white dark:bg-gray-800 dark:text-white
            hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] dark:hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.01)] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] dark:focus:shadow-[inset_0_1px_2px_rgba(255,255,255,0.01)] ${inputClassName}
          `}
          ref={ref}
        />
      </div>
      <button
        type="submit"
        className={`h-10 px-3 flex items-center justify-center rounded-r border-2 border-l-0 
          border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none 
          text-sm font-medium dark:text-white transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50 
          ${
            isInputFocused
              ? 'opacity-100 max-w-[80px] ml-0'
              : 'opacity-0 max-w-0 ml-[-2px] overflow-hidden'
          }`}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
      >
        {buttonText}
      </button>
    </form>
  );
}
