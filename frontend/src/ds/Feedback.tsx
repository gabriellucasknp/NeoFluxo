import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { IconButton } from './Button';
import { spring, ease } from './motion';

/*
 * Alerta, estado vazio e carregando: uma versão de cada (hoje são 4 + 4 + 4).
 * O alerta é um card suave com ícone redondo, sem borda lateral; some deslizando quando fechado.
 */

type Tone = 'info' | 'success' | 'warning' | 'danger';
const ALERT: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: 'bg-info-soft', icon: 'bg-info text-white', Icon: Info },
  success: { box: 'bg-success-soft', icon: 'bg-success text-white', Icon: CheckCircle2 },
  warning: { box: 'bg-warning-soft', icon: 'bg-warning text-white', Icon: AlertTriangle },
  danger: { box: 'bg-danger-soft', icon: 'bg-danger text-white', Icon: XCircle },
};

export function Alert({
  tone = 'info',
  title,
  children,
  onClose,
  action,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  onClose?: () => void;
  action?: ReactNode;
}) {
  const a = ALERT[tone];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={`flex items-start gap-4 rounded-tile p-4 pr-3 ${a.box}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.icon}`}>
        <a.Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1 pt-1.5">
        <p className="text-sm font-semibold text-fg">{title}</p>
        {children && <div className="mt-1 text-sm text-fg-2">{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onClose && (
        <IconButton label="Fechar aviso" size="sm" tone="soft" className="bg-transparent" onClick={onClose}>
          <X className="h-4 w-4" />
        </IconButton>
      )}
    </div>
  );
}

/** Envelope pra alerta que pode sumir: fecha encolhendo a altura sem pular o resto da página. */
export function Dismissible({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto', transition: spring.soft }}
          exit={{ opacity: 0, height: 0, transition: { duration: 0.24, ease } }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border-2 border-dashed border-line-strong px-6 py-12 text-center">
      <motion.span
        initial={{ scale: 0.8, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-fg"
      >
        {icon}
      </motion.span>
      <p className="font-display text-lg font-semibold text-fg">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Bloco que brilha enquanto carrega; o brilho é um gradiente que corre por transform. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-control bg-surface-3/70 ${className}`}>
      <motion.div
        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
        initial={{ x: '-100%' }}
        animate={{ x: '250%' }}
        transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-3 text-sm text-muted">
      <motion.span
        className="block h-5 w-5 rounded-full border-2 border-surface-3 border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {label}
    </span>
  );
}

/** Barra de progresso em pílula (refs 1, 9): enche com mola até o valor. */
export function Progress({ value, label, detail }: { value: number; label?: string; detail?: string }) {
  return (
    <div className="w-full">
      {(label || detail) && (
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="text-fg-2">{label}</span>
          <span className="font-semibold text-fg tabular">{detail ?? `${value}%`}</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="h-full origin-left rounded-full bg-primary"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: value / 100 }}
          viewport={{ once: true }}
          transition={{ ...spring.soft, stiffness: 120 }}
        />
      </div>
    </div>
  );
}
