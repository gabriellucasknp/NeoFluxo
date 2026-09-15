import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderPlus,
  FolderOpen,
  ClipboardCheck,
  Settings,
  Users,
  ShieldCheck,
  FileText,
  ScrollText,
  History,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" />, roles: ['projetista', 'analista', 'admin'] },
  { to: '/app/novo-projeto', label: 'Novo Projeto', icon: <FolderPlus className="h-4.5 w-4.5" />, roles: ['projetista'] },
  { to: '/app/meus-projetos', label: 'Meus Projetos', icon: <FolderOpen className="h-4.5 w-4.5" />, roles: ['projetista'] },
  { to: '/app/analise', label: 'Análise de Projetos', icon: <ClipboardCheck className="h-4.5 w-4.5" />, roles: ['analista', 'admin'] },
  { to: '/app/analise/dashboard', label: 'Painel do Analista', icon: <ScrollText className="h-4.5 w-4.5" />, roles: ['analista', 'admin'] },
  { to: '/app/admin/dashboard', label: 'Painel Administrativo', icon: <LayoutDashboard className="h-4.5 w-4.5" />, roles: ['admin'] },
  { to: '/app/admin/dis-nor-030', label: 'DIS-NOR-030', icon: <FileText className="h-4.5 w-4.5" />, roles: ['admin'] },
  { to: '/app/admin/dis-nor-053', label: 'DIS-NOR-053', icon: <FileText className="h-4.5 w-4.5" />, roles: ['admin'] },
  { to: '/app/admin/transformadores', label: 'Transformadores', icon: <Building2 className="h-4.5 w-4.5" />, roles: ['admin'] },
  { to: '/app/admin/usuarios', label: 'Usuários', icon: <Users className="h-4.5 w-4.5" />, roles: ['admin'] },
  { to: '/app/admin/logs', label: 'Logs do Sistema', icon: <History className="h-4.5 w-4.5" />, roles: ['admin'] },
  { to: '/app/admin/configuracoes', label: 'Configurações', icon: <Settings className="h-4.5 w-4.5" />, roles: ['admin'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) =>
    user && item.roles.includes(user.role),
  );

  const groups: { label: string; items: NavItem[] }[] = [
    { label: 'Projetista', items: visibleItems.filter((i) => ['/app/dashboard', '/app/novo-projeto', '/app/meus-projetos'].includes(i.to)) },
    { label: 'Análise', items: visibleItems.filter((i) => ['/app/analise', '/app/analise/dashboard'].includes(i.to)) },
    { label: 'Administração', items: visibleItems.filter((i) => i.to.startsWith('/app/admin')) },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <NavLink to="/app/dashboard">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neo-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-800">Portal de Projetos</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Neoenergia PE
              </div>
            </div>
          </div>
        </NavLink>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {groups.map((group) =>
          group.items.length > 0 ? (
            <div key={group.label} className="mb-4">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-neo-50 text-neo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null,
        )}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <NavLink
          to="/validar"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <ShieldCheck className="h-4.5 w-4.5" />
          Validação Pública de Atestado
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg bg-neo-600 p-2 text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
