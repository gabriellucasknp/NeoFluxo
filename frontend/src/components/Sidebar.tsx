import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
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
} from '@/ds/icons';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import { IconButton, Logo, spring } from '@/ds';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" />, roles: ['projetista'] },
  { to: '/app/novo-projeto', label: 'Novo Projeto', icon: <FolderPlus className="h-4.5 w-4.5" />, roles: ['projetista'] },
  { to: '/app/meus-projetos', label: 'Meus Projetos', icon: <FolderOpen className="h-4.5 w-4.5" />, roles: ['projetista'] },
  { to: '/app/analise', label: 'Fila de Análise', icon: <ClipboardCheck className="h-4.5 w-4.5" />, roles: ['analista', 'admin'] },
  { to: '/validar', label: 'Validar Atestado', icon: <ShieldCheck className="h-4.5 w-4.5" />, roles: ['projetista', 'analista', 'admin'] },
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
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));

  const groups: { label: string; items: NavItem[] }[] = [
    { label: 'Projetista', items: visibleItems.filter((i) => ['/app/dashboard', '/app/novo-projeto', '/app/meus-projetos'].includes(i.to)) },
    { label: 'Análise técnica', items: visibleItems.filter((i) => ['/app/analise', '/validar'].includes(i.to)) },
    { label: 'Administração', items: visibleItems.filter((i) => i.to.startsWith('/app/admin')) },
  ];

  const homeLink = user?.role === 'analista' ? '/app/analise' : user?.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard';
  // item ativo = o de caminho mais longo que casa com a URL (a fila /app/analise/:id ainda acende "Fila de análise")
  const ativo = [...visibleItems].sort((a, b) => b.to.length - a.to.length).find((i) => pathname === i.to || pathname.startsWith(i.to + '/'))?.to;

  // Menu azul cheio com a aba da cor da página que "sai" dele (refs 7 e 13); a aba desliza até o item ativo.
  const conteudo = (layoutId: string) => (
    <div className="flex h-full flex-col bg-nav py-6 pl-4 text-on-nav">
      <div className="mb-8 pl-2 pr-4">
        <NavLink to={homeLink} onClick={() => setMobileOpen(false)}>
          <Logo onNav />
        </NavLink>
      </div>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin" aria-label="Menu principal">
        {groups.map((group) =>
          group.items.length > 0 ? (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-4 text-[11px] font-semibold text-on-nav/60">{group.label}</p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const on = item.to === ativo;
                  return (
                    <li key={item.to} className="relative">
                      {on && (
                        <motion.span layoutId={layoutId} transition={spring.layout} className="absolute inset-0 z-0 rounded-l-full bg-canvas">
                          <span className="absolute -top-5 right-0 h-5 w-5 rounded-br-[20px] shadow-[8px_8px_0_8px_rgb(var(--canvas))]" />
                          <span className="absolute -bottom-5 right-0 h-5 w-5 rounded-tr-[20px] shadow-[8px_-8px_0_8px_rgb(var(--canvas))]" />
                        </motion.span>
                      )}
                      <NavLink
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`relative z-10 flex h-11 items-center gap-3 rounded-l-full pl-4 pr-4 text-sm font-medium transition-colors duration-300 ${
                          on ? 'text-accent-fg' : 'text-on-nav/80 hover:bg-white/10 hover:text-on-nav'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null,
        )}
      </nav>
      <div className="pr-4 pt-3">
        <NavLink to="/validar" target="_blank" className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-on-nav/80 transition-colors hover:bg-white/10 hover:text-on-nav">
          <ShieldCheck className="h-4.5 w-4.5" />
          Validação pública
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      <IconButton label="Abrir menu" tone="solid" className="fixed left-4 top-3.5 z-30 lg:hidden" onClick={() => setMobileOpen(true)}>
        <Menu className="h-5 w-5" />
      </IconButton>

      <aside className="hidden w-64 shrink-0 lg:block">{conteudo('aba-app')}</aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 overflow-hidden rounded-r-card"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={spring.soft}
            >
              {conteudo('aba-app-celular')}
              <IconButton label="Fechar menu" tone="onColor" size="sm" className="absolute right-4 top-6" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </IconButton>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
