import React from "react";
import "./Input.css";

export function Input({ label, error, icon, className = "", ...rest }) {
  return (
    <div className={`input-wrap ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-inner">
        {icon && <span className="input-icon">{icon}</span>}
        <input className={`input-field ${icon ? "has-icon" : ""} ${error ? "has-error" : ""}`} {...rest} />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}