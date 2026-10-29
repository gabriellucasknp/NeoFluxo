import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { rise, stagger } from './motion';

/*
 * Cabeçalho de página (hoje são 5): título grande em até duas linhas à esquerda (refs 5, 6, 9, 10)
 * e, à direita, os números da página soltos, sem card (refs 3, 6, 9), ou as ações.
 */

export interface HeaderStat {
  label: string;
  value: string;
  unit?: string;
}

export function PageHeader({
  title,
  greeting,
  stats,
  actions,
  description,
}: {
  title: string;
  /** uma linha de apoio embaixo do título */
  description?: string;
  /** linha pequena acima do título: "Bom dia, Carlos" */
  greeting?: string;
  stats?: HeaderStat[];
  actions?: ReactNode;
}) {
  return (
    <motion.header variants={stagger} initial="hidden" animate="show" className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
      <motion.div variants={rise} className="min-w-0">
        {greeting && <p className="mb-2 text-sm text-muted">{greeting}</p>}
        <h1 className="max-w-[12ch] font-display text-4xl font-medium leading-[1.05] tracking-tight text-fg sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm text-muted">{description}</p>}
      </motion.div>
      {stats && (
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          {stats.map((s) => (
            <motion.div key={s.label} variants={rise}>
              <p className="mb-1 text-sm text-muted">{s.label}</p>
              <p className="font-display text-4xl font-light tracking-tight text-fg tabular">
                {s.value}
                {s.unit && <sup className="ml-1 text-sm font-medium text-muted">{s.unit}</sup>}
              </p>
            </motion.div>
          ))}
        </div>
      )}
      {actions && (
        <motion.div variants={rise} className="flex flex-wrap items-center gap-2">
          {actions}
        </motion.div>
      )}
    </motion.header>
  );
}

/** Cabeçalho de bloco dentro de card (hoje são 2): título + apoio à esquerda, pílulas e ↗ à direita (refs 5, 8, 10). */
export function SectionHeader({ title, subtitle, icon, actions }: { title: string; subtitle?: string; icon?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-fg-2">{icon}</span>}
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-fg">{title}</h3>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
