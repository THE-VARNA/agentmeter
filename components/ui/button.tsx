import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
}

export function Button({
  children, onClick, disabled, type = "button",
  variant = "primary", size = "md", className = "", style, asChild
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    borderRadius: 10, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1, border: "none", transition: "all 200ms ease",
    padding: size === "sm" ? "7px 14px" : size === "lg" ? "13px 28px" : "10px 20px",
    fontSize: size === "sm" ? 12 : size === "lg" ? 15 : 14,
    ...(variant === "primary"
      ? { background: "linear-gradient(135deg, #22d3ee, #818cf8)", color: "#04080e", boxShadow: "0 4px 16px rgba(34,211,238,0.28)" }
      : variant === "secondary"
      ? { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#eef2f7", backdropFilter: "blur(12px)" }
      : { background: "transparent", color: "#8899aa", border: "1px solid rgba(255,255,255,0.08)" }),
    ...style,
  };

  if (asChild) {
    return <span className={className} style={base}>{children}</span>;
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className} style={base}>
      {children}
    </button>
  );
}
