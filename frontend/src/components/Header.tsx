import { useNavigate } from 'react-router-dom';
import { Bell, Settings } from '@/ds/icons';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { IconButton, SearchField, UserMenu } from '@/ds';
import { useState } from 'react';
import type { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  projetista: 'Projetista',
  analista: 'Analista Neoenergia',
  admin: 'Administrador',
};

/* Topo sem barra, sobre o fundo da página (refs 8 e 10): busca em pílula, botões redondos e o usuário em pílula. */
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');

  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 bg-canvas/85 px-4 pl-16 backdrop-blur-md lg:px-8">
      <div className="flex flex-1 items-center">
        <SearchField value={busca} onChange={setBusca} placeholder="Buscar projetos, atestados..." className="hidden w-full max-w-md sm:block" />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle tone="outline" />
        <span className="relative">
          <IconButton label="Notificações" tone="outline">
            <Bell className="h-5 w-5" />
          </IconButton>
          <span className="pointer-events-none absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-canvas" />
        </span>
        <UserMenu
          name={user.name}
          role={roleLabels[user.role]}
          items={user.role === 'admin' ? [{ icon: <Settings className="h-4 w-4" />, label: 'Configurações', onClick: () => navigate('/app/admin/configuracoes') }] : []}
          onLogout={() => {
            logout();
            navigate('/');
          }}
        />
      </div>
    </header>
  );
}
