import { useEffect, useState } from 'react';
import { Moon, Sun } from '@/ds/icons';
import { IconButton } from '@/ds/Button';

type Theme = 'light' | 'dark';
const KEY = 'neofluxo-theme';

/** Sem escolha salva, começa pelo tema do aparelho; depois disso o botão só alterna claro ↔ escuro. */
function readTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* sem storage */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Alterna claro ↔ escuro. O tema vai em <html data-theme>.
 *  É um IconButton do design system: ícone centrado e o mesmo hover dos outros botões. */
export function ThemeToggle({ className = '', tone = 'soft' }: { className?: string; tone?: 'soft' | 'outline' }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const trocar = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* sem storage: vale só nesta aba */
    }
  };

  // o ícone mostra para onde o toque leva, como no iOS
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <IconButton label={theme === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'} tone={tone} onClick={trocar} className={className}>
      <Icon className="h-5 w-5" />
    </IconButton>
  );
}
