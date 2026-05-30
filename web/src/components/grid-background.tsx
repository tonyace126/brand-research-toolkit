"use client";

import { useEffect, useRef } from "react";

export default function GridBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      el.style.setProperty("--mx", e.clientX + "px");
      el.style.setProperty("--my", e.clientY + "px");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <div ref={ref} aria-hidden className="grid-bg">
      <div className="grid-bg__blob grid-bg__blob--1" />
      <div className="grid-bg__blob grid-bg__blob--2" />
      <div className="grid-bg__grid" />
      <div className="grid-bg__reveal" />
      <div className="grid-bg__halftone" />
    </div>
  );
}
