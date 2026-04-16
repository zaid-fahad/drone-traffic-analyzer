import { forwardRef } from "react";

const Button = forwardRef(({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500",
    secondary: "bg-slate-700 hover:bg-slate-800 text-slate-200 focus:ring-slate-500",
    outline: "border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white focus:ring-slate-500",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;