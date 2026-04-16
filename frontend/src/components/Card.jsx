import { forwardRef } from "react";

const Card = forwardRef(({
  children,
  className = "",
  padding = "md",
  ...props
}, ref) => {
  const baseClasses = "bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm";

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;