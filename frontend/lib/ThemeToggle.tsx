"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("geoi-theme");
    const initial = saved === "light" || saved === "dark" ? saved : null;
    if (initial) document.documentElement.dataset.theme = initial;
    setTheme(initial ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("geoi-theme", next);
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel-2)] transition"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
