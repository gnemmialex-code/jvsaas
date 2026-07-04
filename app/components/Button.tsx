import { forwardRef, ButtonHTMLAttributes } from "react";
import { InlineLoader } from "./Loader";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5",
  lg: "px-7 py-3.5 text-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const base = `${variantClasses[variant]} ${sizeClasses[size]} inline-flex items-center justify-center gap-2`;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${className}`}
        {...props}
      >
        {loading ? (
          <InlineLoader size="sm" />
        ) : (
          iconPosition === "left" && icon && icon
        )}
        {children}
        {!loading && iconPosition === "right" && icon && icon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
