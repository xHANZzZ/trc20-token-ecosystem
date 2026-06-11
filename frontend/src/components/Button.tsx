import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-tealAccent/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-tealAccent text-obsidian hover:bg-[#00d1b5] hover:shadow-teal-glow shadow-md",
    secondary: "bg-slateCard border border-spaceBorder text-pureWhite hover:bg-slateCard/85",
    destructive: "bg-crimsonRed text-pureWhite hover:bg-red-600 hover:shadow-red-glow",
    outline: "bg-transparent border border-tealAccent/40 text-tealAccent hover:bg-tealAccent/10"
  };

  const currentVariantStyle = variants[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${currentVariantStyle} ${className}`}
      {...props}
    >
      {loading && (
        <div className="w-3.5 h-3.5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
      )}
      <span>{children}</span>
    </button>
  );
};
