import { Bell, Search, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  projetista: 'Projetista',
  analista: 'Analista Neoenergia',
  admin: 'Administrador / Engenheiro',
};

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-surface/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            type="text"
            placeholder="Buscar projetos, atestados..."
            className="w-full rounded-lg border border-line bg-surface-2 py-2 pl-9 pr-3 text-sm text-fg-2 placeholder-subtle focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface-2">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="h-6 w-px bg-surface-3" />

        <div ref={ref} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-surface-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-fg">{user.name}</p>
              <p className="text-[11px] leading-tight text-subtle">{roleLabels[user.role]}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-subtle sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 animate-fade-in rounded-lg border border-line bg-surface py-1 shadow-lg">
              <div className="border-b border-line px-4 py-3">
                <p className="text-sm font-medium text-fg">{user.name}</p>
                <p className="text-xs text-subtle">{user.email}</p>
                <p className="mt-1 text-[11px] font-medium text-accent-fg">{roleLabels[user.role]}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted transition-colors hover:bg-surface-2"
              >
                <LogOut className="h-4 w-4" />
                Sair do sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
