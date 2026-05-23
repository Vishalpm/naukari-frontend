import React from "react";
import "./Badge.css";

export function Badge({ children, variant = "slate" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}