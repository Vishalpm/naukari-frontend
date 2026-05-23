import React from "react";
import "./Button.css";

export function Button({ children, variant = "primary", size = "md", loading, className = "", ...rest }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${loading ? "btn-loading" : ""} ${className}`}
      disabled={rest.disabled || loading}
      {...rest}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  );
}