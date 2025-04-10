import { useState, FormEvent, ChangeEvent } from "react";

interface AnimatedSearchInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  type?: string;
  buttonText?: string;
  className?: string;
  inputClassName?: string;
}

export function AnimatedSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  id,
  name,
  type = "text",
  buttonText = "Search",
  className = "",
  inputClassName = "",
}: AnimatedSearchInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <form onSubmit={onSubmit} className={`flex items-center ${className}`}>
      <div className="relative flex-grow group">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder={placeholder}
          className={`h-10 w-full 
            ${
              isInputFocused ? "rounded-l" : "rounded"
            } border-2 border-gray-200 p-2 
            focus:outline-none focus:border-gray-300 transition-all duration-300 ease-in-out 
            relative z-10 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:via-blue-50/20 
            hover:to-purple-50/10 hover:shadow-inner focus:bg-gradient-to-r focus:from-gray-50 
            focus:via-blue-50/20 focus:to-purple-50/10 focus:shadow-inner ${inputClassName}
          `}
        />
      </div>
      <button
        type="submit"
        className={`h-10 px-3 flex items-center justify-center rounded-r border-2 border-l-0 
          border-gray-200 bg-background hover:bg-gray-100 focus:bg-gray-100 focus:outline-none 
          text-sm font-medium transition-all duration-300 ease-in-out disabled:pointer-events-none disabled:opacity-50 
          ${
            isInputFocused
              ? "opacity-100 max-w-[80px] ml-0"
              : "opacity-0 max-w-0 ml-[-2px] overflow-hidden"
          }`}
      >
        {buttonText}
      </button>
    </form>
  );
}
