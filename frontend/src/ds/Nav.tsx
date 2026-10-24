import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, LogOut, Menu, Settings, User, X, Zap } from 'lucide-react';
import { IconButton } from './Button';
import { pop, spring } from './motion';

/*
 * Menus e logo. Menu lateral azul cheio com o item ativo numa aba da cor da página que "sai" do menu,
 * com os cantos côncavos (refs 7 e 13, sem anotação = direção). A aba desliza até o item clicado.
 */

export function Logo({ onNav, compact }: { onNav?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${onNav ? 'bg-white text-nav' : 'bg-primary text-on-primary'}`}>
        <Zap className="h-5 w-5" fill="currentColor" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={`block font-display text-lg font-semibold ${onNav ? 'text-on-nav' : 'text-fg'}`}>NeoFluxo</span>
          <span className={`block text-xs ${onNav ? 'text-on-nav/70' : 'text-muted'}`}>Neoenergia Pernambuco</span>
        </span>
      )}
    </div>
  );
}

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  count?: number;
}

export function SideNav({
  items,
  active,
  onChange,
  footer,
  layoutId = 'aba-menu',
}: {
  items: NavItem[];
  active: string;
  onChange: (id: string) => void;
  footer?: ReactNode;
  layoutId?: string;
}) {
  return (
    <nav aria-label="Menu principal" className="flex h-full w-64 shrink-0 flex-col bg-nav py-7 pl-5 text-on-nav">
      <div className="mb-10 pr-5">
        <Logo onNav />
      </div>
      <ul className="space-y-1.5">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id} className="relative">
              {on && (
                <motion.span layoutId={layoutId} transition={spring.layout} className="absolute inset-0 rounded-l-full bg-canvas">
                  {/* cantos côncavos que ligam a aba ao conteúdo */}
                  <span className="absolute -top-5 right-0 h-5 w-5 rounded-br-[20px] shadow-[8px_8px_0_8px_rgb(var(--canvas))]" />
                  <span className="absolute -bottom-5 right-0 h-5 w-5 rounded-tr-[20px] shadow-[8px_-8px_0_8px_rgb(var(--canvas))]" />
                </motion.span>
              )}
              <button
                type="button"
                onClick={() => onChange(it.id)}
                aria-current={on ? 'page' : undefined}
                className={`relative flex h-12 w-full items-center gap-3 rounded-l-full pl-4 pr-5 text-sm font-medium transition-colors duration-300 ${
                  on ? 'text-accent-fg' : 'text-on-nav/80 hover:text-on-nav'
                }`}
              >
                <motion.span whileHover={{ scale: 1.12 }} transition={spring.snappy} className="flex">
                  {it.icon}
                </motion.span>
                <span className="flex-1 text-left">{it.label}</span>
                {it.count !== undefined && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${on ? 'bg-primary text-on-primary' : 'bg-white/20'}`}>
                    {it.count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {footer && <div className="mt-auto pr-5">{footer}</div>}
    </nav>
  );
}

/** Menu do usuário no topo: pílula com foto e nome (refs 8, 9); a lista abre crescendo do botão. */
export function UserMenu({ name, role, onLogout }: { name: string; role: string; onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');

  return (
    <div ref={root} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        whileTap={{ scale: 0.97 }}
        transition={spring.snappy}
        className="flex items-center gap-3 rounded-full bg-raised py-1.5 pl-1.5 pr-4 ring-1 ring-inset ring-line transition-colors hover:bg-surface-2"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">{initials}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs text-muted">{role}</span>
          <span className="block text-sm font-semibold text-fg">{name}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring.snappy} className="text-muted">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={pop}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 z-30 mt-2 w-56 rounded-tile bg-raised p-1.5 shadow-pop ring-1 ring-line"
          >
            {[
              { icon: <User className="h-4 w-4" />, label: 'Meu perfil' },
              { icon: <Settings className="h-4 w-4" />, label: 'Configurações' },
            ].map((i) => (
              <button key={i.label} className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg">
                {i.icon}
                {i.label}
              </button>
            ))}
            <div className="my-1 h-px bg-line" />
            <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm text-danger-fg transition-colors hover:bg-danger-soft">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Menu do celular: o mesmo menu azul entrando da esquerda por cima de um fundo escurecido. */
export function MobileNav(props: Parameters<typeof SideNav>[0]) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton label="Abrir menu" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </IconButton>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <motion.div className="absolute inset-0 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              className="absolute inset-y-0 left-0 overflow-hidden rounded-r-card"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={spring.soft}
            >
              <SideNav
                {...props}
                layoutId="aba-menu-celular"
                onChange={(id) => {
                  props.onChange(id);
                  setTimeout(() => setOpen(false), 260);
                }}
              />
              <IconButton label="Fechar menu" tone="onColor" size="sm" className="absolute right-4 top-7" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </IconButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
