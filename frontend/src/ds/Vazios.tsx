import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check, X } from './icons';
import { spring, ease } from './motion';

/*
 * Estados vazios, caminho A (Mateus, 23/10): a peça da marca que já existe no produto conta o próximo passo.
 * Sem ícone solto num círculo. Três peças: o medidor zerado (nada calculado ainda), o filtro ativo (o filtro
 * escondeu tudo, com "limpar") e o fluxo todo verde (fila zerada é boa notícia, não erro).
 */

function Texto({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <>
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {children && <p className="max-w-sm text-sm text-fg-2">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </>
  );
}

function Moldura({ children, compacto }: { children: ReactNode; compacto?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className={`flex flex-col items-center gap-2 text-center ${compacto ? 'py-8' : 'py-14'}`}
    >
      {children}
    </motion.div>
  );
}

/** Nada calculado ainda: o medidor do produto em 0,0 kW, com a seta parada no começo. */
export function VazioMedidor({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <Moldura>
      <svg viewBox="0 0 220 124" className="mb-1 h-auto w-44" aria-hidden>
        <path d="M22 112a88 88 0 0 1 176 0" fill="none" stroke="rgb(var(--surface-3))" strokeWidth="22" strokeLinecap="round" />
        <path d="M84 28l-6-18" stroke="rgb(var(--fg))" strokeWidth="3" strokeLinecap="round" />
        {/* gira em torno do próprio centro, como a seta do DemandGauge (origem em px no SVG some com ela) */}
        <motion.g
          initial={{ rotate: -60 }}
          animate={{ rotate: -90 }}
          transition={{ type: 'spring', stiffness: 80, damping: 12 }}
        >
          <path d="M110 76L122 108L110 101L98 108Z" fill="rgb(var(--fg))" />
        </motion.g>
      </svg>
      <p className="-mt-3 mb-2 font-display text-4xl font-light tracking-tight text-fg">
        0,0 <span className="text-lg font-medium text-muted">kW</span>
      </p>
      <Texto title={title} action={action}>
        {children}
      </Texto>
    </Moldura>
  );
}

/** O filtro escondeu tudo: mostra qual filtro está ativo, com o x pra tirar, e o caminho de volta. */
export function VazioFiltro({
  filtro,
  onLimpar,
  title,
  children,
  action,
}: {
  filtro: string;
  onLimpar: () => void;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Moldura>
      <motion.button
        type="button"
        onClick={onLimpar}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={spring.snappy}
        className="mb-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-on-primary"
        aria-label={`Tirar o filtro ${filtro}`}
      >
        {filtro}
        <X className="h-3.5 w-3.5" />
      </motion.button>
      <Texto title={title} action={action}>
        {children}
      </Texto>
    </Moldura>
  );
}

/** Fila zerada: o fluxo do projeto inteiro em verde. */
export function VazioFluxo({ title, children, etapas = ['Memorial', 'Cálculo', 'Análise'], compacto }: { title: string; children?: ReactNode; etapas?: string[]; compacto?: boolean }) {
  return (
    <Moldura compacto={compacto}>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
        {etapas.map((e, i) => (
          <span key={e} className="flex items-center gap-1.5">
            {i > 0 && <span className="h-0.5 w-4 rounded-full bg-success/40" />}
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.soft, delay: i * 0.12 }}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-success-soft px-3 text-xs font-semibold text-success-fg"
            >
              <Check className="h-3.5 w-3.5" />
              {e}
            </motion.span>
          </span>
        ))}
      </div>
      <Texto title={title}>{children}</Texto>
    </Moldura>
  );
}

/** Lista curta dentro de um card (unidades, cargas, histórico): uma linha calma, com a ação ao lado. */
export function VazioLinha({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-tile border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">
      {children}
      {action}
    </div>
  );
}
