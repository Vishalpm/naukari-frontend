import React from "react";
import { Navbar } from "./Navbar";
import "./Layout.css";

export function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">{children}</main>
    </div>
  );
}