import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type Theme = 'system' | 'light' | 'dark';
const KEY = 'neofluxo-theme';
const ORDER: Theme[] = ['system', 'light', 'dark'];
const LABEL: Record<Theme, string> = { system: 'Tema do sistema', light: 'Tema claro', dark: 'Tema escuro' };
const ICON = { system: Monitor, light: Sun, dark: Moon };

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

/** Alterna sistema → claro → escuro. O tema vai em <html data-theme>; sem atributo = segue o sistema. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      if (theme === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, theme);
    } catch {
      /* sem storage: vale só nesta aba */
    }
  }, [theme]);

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`${LABEL[theme]} (trocar para ${LABEL[next].toLowerCase()})`}
      title={LABEL[theme]}
      className={`rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg ${className}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
