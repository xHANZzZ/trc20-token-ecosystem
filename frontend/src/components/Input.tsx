import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isValid = false,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wider text-mutedGray">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`w-full bg-obsidian border text-xs px-4 py-3 rounded-lg text-pureWhite outline-none placeholder-mutedGray/50 transition-all font-sans
            ${error 
              ? 'border-crimsonRed/60 focus:border-crimsonRed' 
              : isValid 
                ? 'border-tealAccent/60 focus:border-tealAccent' 
                : 'border-spaceBorder focus:border-tealAccent/40 focus:ring-1 focus:ring-tealAccent/20'
            }
            ${className}`}
          {...props}
        />
        {isValid && !error && (
          <span className="absolute right-3.5 top-3.5 text-tealAccent text-xs font-bold">
            ✓
          </span>
        )}
      </div>
      {error && (
        <span className="text-[10px] text-crimsonRed font-medium">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
