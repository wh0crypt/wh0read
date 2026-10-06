'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wh0read-theme');
    const value = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(value);
    document.documentElement.dataset.theme = value ? 'dark' : 'light';
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('wh0read-theme', next ? 'dark' : 'light');
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
  }

  return <button className="icon-button" onClick={toggle} aria-label="Cambiar modo de color">{dark ? '☀' : '☾'}</button>;
}
